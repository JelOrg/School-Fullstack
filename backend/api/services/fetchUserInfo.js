// file has to do with getting all types of info that is related to users
import { prisma } from "#utils/prismaClient";

async function exampleFunction(userId) {
  // Example: Fetch all records from a table
  // Replace 'user' with your actual model name
  const allUsers = await prisma.users.findUnique({
    where: {
      userId: userId,
    },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      department: {
        select: {
          departmentName: true,
        },
      },
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}
