import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';

// Load environment variables for standalone seed execution.
dotenv.config({ path: '../.env.docker' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.upsert({
      where: {
        slug: 'ai-knowledge-hub',
      },
      update: {},
      create: {
        name: 'AI Knowledge Hub',
        slug: 'ai-knowledge-hub',
      },
    });

    const user = await tx.user.upsert({
      where: {
        email: 'demo@example.com',
      },
      update: {},
      create: {
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash: 'seed-only-not-a-real-password-hash',
      },
    });

    await tx.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        organizationId: organization.id,
        role: 'OWNER',
      },
    });

    console.log('Seed completed successfully');
    console.log(`Organization: ${organization.name} (${organization.id})`);
    console.log(`User: ${user.email} (${user.id})`);
  });
}

try {
  await main();
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
