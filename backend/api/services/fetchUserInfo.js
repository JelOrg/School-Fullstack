import { prisma } from "#utils/prismaClient";

async function main() {
  // Example: Fetch all records from a table
  // Replace 'user' with your actual model name
  const allUsers = await prisma.users.findMany();
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main();
