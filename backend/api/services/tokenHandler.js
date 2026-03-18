import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import "#utils/absoluteEnvPath";
import { prisma } from "#utils/prismaClient";

/**
 * Signs a JWT and attaches it to an HttpOnly cookie.
 * @param {Object} res - The Express response object.
 * @param {Object} user - The user data to encode in the token.
 * @param {Object} userInformation - need to be an object with userId, userRole, userDepartment
 */
export const generateToken = (
  userId,
  userRoleName,
  userDepartmentName,
  // userFirstName = null,
  // userLastName = null,
) => {
  //What fomat of data needs to be inserted into the userInformation params
  //? { userId: "bob", userRole: "meria", userDepartment: "henny" }

  //generates a jwt token

  // 1. Create the stateless token
  const token = jwt.sign(
    {
      //! using prim userId key might not be the best
      userId: userId,
      userRoleName: userRoleName,
      userDepartmentName: userDepartmentName,
      //optional name info for authorization/auditing
      // userFirstName: userFirstName,
      // userLastName: userLastName,
      jti: randomUUID(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  return { success: true, token: token };
};

//* ProcessToken if it is valid, and also returns payload that is inide the token
//verifies the jwt token and decodes it to get user info back
export const processToken = (userToken) => {
  try {
    const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);

    return { success: true, tokenInfo: decodedToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

//* Validates token with real db data
export const validateToken = async (processedToken) => {
  //Checks if the user is still active in the db, so no bans or such
  const user = await prisma.users
    .findUnique({
      where: {
        userId: processedToken.userId,
      },
      select: {
        isActive: true,
      },
    })
    .catch((err) => {
      // This will show exactly where it failed in your logs
      err.message = `[Auth DB Check Failed]: ${err.message}`;
      throw err;
    });

  // 2. Run the checks
  const isDeactivated = !user || !user.isActive;

  if (isDeactivated) return { success: false, message: "token not valid" };

  return { success: true, message: "token is valid" };
};
