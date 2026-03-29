import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcrypt";

function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const adapter = new PrismaLibSql({
    url: url.startsWith("file:") ? url : `file:${url}`,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const email = process.env.ADMIN_EMAIL || "admin@barbearia.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({ data: { email, passwordHash, name } });
    console.log(`✅ Admin criado: ${email} / ${password}`);
  } else {
    console.log(`ℹ️  Admin já existe: ${email}`);
  }

  // Working hours (Mon-Sat open, Sun closed)
  const existingHours = await prisma.workingHours.count();
  if (existingHours === 0) {
    const days = [
      { dayOfWeek: 0, isOpen: false, openTime: "09:00", closeTime: "18:00" }, // Sun
      { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "19:00" },  // Mon
      { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "19:00" },  // Tue
      { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "19:00" },  // Wed
      { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "19:00" },  // Thu
      { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "19:00" },  // Fri
      { dayOfWeek: 6, isOpen: true, openTime: "09:00", closeTime: "17:00" },  // Sat
    ];
    await prisma.workingHours.createMany({ data: days });
    console.log("✅ Horários de funcionamento criados");
  }

  // Services
  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    const services = [
      {
        name: "Corte Simples",
        description: "Corte na tesoura ou máquina",
        durationMins: 30,
        price: 35,
      },
      {
        name: "Corte + Barba",
        description: "Corte completo com barba aparada",
        durationMins: 60,
        price: 60,
      },
      {
        name: "Barba",
        description: "Aparar e modelar a barba",
        durationMins: 30,
        price: 30,
      },
      {
        name: "Pigmentação",
        description: "Coloração e pigmentação capilar",
        durationMins: 45,
        price: 80,
      },
    ];
    await prisma.service.createMany({ data: services });
    console.log("✅ Serviços criados");
  }

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
