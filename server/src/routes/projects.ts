import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { projectSchema } from '../validators/index.js';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Get all projects (only owned or assigned projects for members)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where:
        req.user?.role === 'ADMIN'
          ? {}
          : {
              OR: [
                { ownerId: req.user?.id },
                { tasks: { some: { assignedToId: req.user?.id } } },
              ],
            },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: { select: { id: true, status: true } },
      },
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: { include: { assignedTo: { select: { id: true, name: true, email: true } } } },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check access
    if (
      req.user?.role === 'MEMBER' &&
      project.ownerId !== req.user.id &&
      !project.tasks.some((t) => t.assignedToId === req.user?.id)
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project (Admin only)
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = projectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...data,
        ownerId: req.user!.id,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project (Admin only)
router.put('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = projectSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project (Admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId !== req.user?.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
