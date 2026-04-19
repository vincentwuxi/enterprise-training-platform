/**
 * Database Seed Script
 * ────────────────────
 * Seeds default admin and demo accounts.
 * Run: node server/seed.js
 */
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from server/ directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AivoloLearn database...');

  // Create admin account (email matches Cloudflare Access identity)
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: 'wenyun@gmail.com' },
    update: { role: 'admin' },  // Ensure admin role even if account exists
    create: {
      email: 'wenyun@gmail.com',
      name: 'Wenyun',
      passwordHash: adminHash,
      role: 'admin',
      department: '技术部',
    },
  });
  console.log(`  ✅ Admin: ${admin.email} (${admin.id})`);

  // Create demo learner account
  const demoHash = await bcrypt.hash('demo123', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@nexuslearn.com' },
    update: {},
    create: {
      email: 'demo@nexuslearn.com',
      name: '张三（演示学员）',
      passwordHash: demoHash,
      role: 'learner',
      department: '产品部',
    },
  });
  console.log(`  ✅ Demo:  ${demo.email} (${demo.id})`);

  // Seed some demo progress
  const demoProgress = [
    { courseId: 'linux-mastery', lessonId: 'philosophy' },
    { courseId: 'calculus-intuition', lessonId: 'limits' },
    { courseId: 'calculus-intuition', lessonId: 'derivatives' },
  ];

  for (const p of demoProgress) {
    await prisma.lessonProgress.upsert({
      where: {
        userId_courseId_lessonId: { userId: demo.id, courseId: p.courseId, lessonId: p.lessonId },
      },
      update: {},
      create: {
        userId: demo.id,
        courseId: p.courseId,
        lessonId: p.lessonId,
        status: 'completed',
        timeSpent: 1800,
      },
    });
  }
  console.log(`  ✅ Demo progress: ${demoProgress.length} lessons`);

  console.log('\n🎉 Seed complete!');
  console.log('  Login: wenyun@gmail.com / (ADMIN_DEFAULT_PASSWORD or admin123)');
  console.log('  Login: demo@nexuslearn.com / demo123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
