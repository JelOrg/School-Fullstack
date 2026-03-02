import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createUser = async (userData) => {
  // Business Logic: Hash password, check if email exists, etc.
  return await prisma.user.create({
    data: {
      email: userData.email,
      password: userData.password, // In real life, hash this!
    },
  });
};
