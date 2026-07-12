import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Settings singleton (id = 1) ---
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  console.log("  ✓ Settings row ensured");

  // --- Default users for each role ---
  const users = [
    { name: "System Admin", email: "admin@ecosphere.local", password: "Admin@123", role: Role.ADMIN },
    { name: "Dept Manager", email: "manager@ecosphere.local", password: "Manager@123", role: Role.MANAGER },
    { name: "Jane Employee", email: "employee@ecosphere.local", password: "Employee@123", role: Role.EMPLOYEE },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
    console.log(`  ✓ ${u.role.padEnd(8)} ${u.email}`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
