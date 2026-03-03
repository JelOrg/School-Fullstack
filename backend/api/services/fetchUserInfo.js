// file has to do with getting all types of info that is related to users
import { prisma } from "#utils/prismaClient";

// Example: Fetch all records from a table
// Replace 'user' with your actual model name
async function exampleFunction(userId) {
  const allUsers = await prisma.users.findUnique({
    where: {
      userId: userId,
    },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      role: {
        select: {
          roleName: true,
        },
      },
      department: {
        select: {
          departmentName: true,
        },
      },
    },
  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

// * Actual funcs

//!A way to get the data from the DB so you can COMPARE it with what the user send during LOGIN
export async function validateUserLogin(userEmail, providedPassword) {
  const user = await prisma.users.findUnique({
    where: { email: userEmail },
    select: { userId: true, saltedPassword: true },
  });

  //validates if the user exist
  if (!user) return { success: false, message: "User Doesn't Exist" };
  //validates the password
  if (!user.saltedPassword === providedPassword)
    return { success: false, message: "Incorrect email or password" };

  //returns if sucessfull
  return { success: true, message: "Logged in", userId: user.userId };
}

//Getting just general user info like department, role, userId, and placeholder decrypt