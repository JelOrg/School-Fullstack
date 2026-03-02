// ? get data from the database that has to do with the usertable or getting info from the user or from the user table
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// TODO prop doesn't work, but here for ref
// * This has to speak with the database (get and retrieve)
export const getUserById = async (id) => {
  // ? get data from the database
};
