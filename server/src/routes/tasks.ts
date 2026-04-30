import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { taskSchema, updateTaskSchema } from '../validators/index.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks (filtered by access level)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where:
        req.user?.role === 'ADMIN'
          ? {}
          : {
              OR: [
                { project: { ownerId: req.user?.id } },
                { assignedToId: req.user?.id },
              ],
            },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: { include: { owner: { select: { id: true, name: true } } } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check access
    if (
      req.user?.role === 'MEMBER' &&
      task.project.ownerId !== req.user.id &&
      task.assignedToId !== req.user.id
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create task (Admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = taskSchema.parse(req.body);

    // Check project exists and user owns it
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignedToId: data.assignedToId,
        projectId: data.projectId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { ownerId: true } } },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Members can only update status of their own tasks
    const isAdmin = req.user?.role === 'ADMIN';
    const isProjectOwner = task.project.ownerId === req.user?.id;
    const isAssigned = task.assignedToId === req.user?.id;

    if (!isAdmin && !isProjectOwner) {
      if (!isAssigned) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      // Members can only update status
      if (req.body.title || req.body.description || req.body.priority || req.body.dueDate || req.body.assignedToId) {
        return res.status(403).json({ error: 'Members can only update task status' });
      }
    }

    const data = updateTaskSchema.parse(req.body);

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (Admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { ownerId: true } } },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.project.ownerId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
