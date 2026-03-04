import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import "#utils/absoluteEnvPath";

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
