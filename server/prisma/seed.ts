import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create member user
  const memberPassword = await bcrypt.hash('member123', 10);
  const member = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      name: 'Member User',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      name: 'Alpha Project',
      description: 'Demo project for task management',
      ownerId: admin.id,
    },
  });

  // Create tasks
  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Finish Documentation',
      description: 'Complete API documentation for the project',
      status: 'TODO',
      priority: 'HIGH',
      projectId: project.id,
      assignedToId: member.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin credentials: admin@example.com / admin123');
  console.log('Member credentials: member@example.com / member123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
