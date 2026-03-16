// file has to do with getting all types of info that is related to users
import { prisma } from "#utils/prismaClient";
import bcrypt from "bcrypt";

//!A way to get the data from the DB so you can COMPARE it with what the user send during LOGIN
/**
 * uses @param - userEmail, providedPassword  to get the user password info, and also validates if the login password is correct
 * @returns an object?
 */
export const validateUserLogin = async (
  userRoleName,
  userEmail,
  providedPassword,
) => {
  const user = await prisma.users
    .findFirst({
      //* Not really needed to role, because email is unique. This is just to be sure...
      where: {
        email: userEmail,
        role: {
          roleName: userRoleName,
        },
      },
      select: { userId: true, saltedPassword: true },
    })
    .catch((err) => {
      err.message = `[Failed getting user login data]: ${err.message}`;
      throw err;
    });

  //validates if the user exist
  if (!user) return { success: false, message: "User or email is incorrect" };

  //compares the salted password and the unslated password using bcrypt to see if they are the same
  const isMatch = await bcrypt.compare(providedPassword, user.saltedPassword);
  if (!isMatch) {
    return { success: false, message: "Username or email is incorrect" };
  }

  //returns if sucessfull
  return { success: true, message: "Logged in", userId: user.userId };
};

//get the info of a user from an object like {userId: something} to get userId, userRole, userDepartment, email
/**
 * fetches userInfo based on the userId
 * Might not be needed, because we will be using a JWT to get general user info
 * @param {*} userInfo
 * @returns
 */
export const fetchUserInfo = async (userId) => {
  const userInfo = await prisma.users
    .findUnique({
      where: {
        userId: userId,
      },
      select: {
        userId: true,
        email: true,
        isActive: true,
        role: {
          select: { roleName: true },
        },
        department: {
          select: {
            departmentName: true,
          },
        },
      },
    })
    .catch((err) => {
      err.message = `[Failed fetching user data]: ${err.message}`;
      throw err;
    });
  //! checks if the userInfo isn't null
  if (!userInfo) return { success: false };

  //? flattens the giving data so we can access it easier
  const flattenedUserInfo = {
    userId: userInfo.userId,
    email: userInfo.email,
    roleName: userInfo.role?.roleName,
    departmentName: userInfo.department?.departmentName,
    isActive: userInfo.isActive,
  };

  //return object with success appended in front
  return {
    success: true,
    data: flattenedUserInfo,
  };
};
