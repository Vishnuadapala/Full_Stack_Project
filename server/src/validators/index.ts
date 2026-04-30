import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name required'),
  description: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title required'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  projectId: z.string().min(1, 'Project ID required'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});
