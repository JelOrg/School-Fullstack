import jwt from "jsonwebtoken";

/**
 * Signs a JWT and attaches it to an HttpOnly cookie.
 * @param {Object} res - The Express response object.
 * @param {Object} user - The user data to encode in the token.
 * @param {Object} userInformation - need to be an object with userId, userRole, userDepartment
 */
export const generateToken = (res, user, userInformation) => {
  //What fomat of data needs to be inserted into the userInformation params
  //? { userId: "bob", userRole: "meria", userDepartment: "henny" }

  //generates a jwt token

  // 1. Create the stateless token
  const token = jwt.sign(
    {
      //! using prim userId key might not be the best
      userId: userInformation.userId,
      userRole: userInformation.userRole,
      userDepartment: userInformation.userDepartment,
      jti: randomUUID(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  // * Make the client browser kill/delete the received token?
  const ONE_HOUR = 1 * 60 * 60 * 1000;
  const cookieOptions = {
    maxAge: ONE_HOUR, // Automatically calculates the Date for you
    // httpOnly: true,    // Essential for security
    // sameSite: "strict", // Essential for security
    // secure: process.env.NODE_ENV === "production", // Only HTTPS in prod
  };

  return res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    message: "Logged in successfully",
  });
};

export const verifyToken = () => {};
