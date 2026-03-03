import jwt from "jsonwebtoken";

/**
 * Signs a JWT and attaches it to an HttpOnly cookie.
 * @param {Object} res - The Express response object.
 * @param {Object} user - The user data to encode in the token.
 * @param {Object} userInformation - need to be an object with userId, userRole, userDepartment
 */
export const sendToken = (res, user, userInformation) => {
  //What fomat of data needs to be inserted into the userInformation params
  //? { userId: "bob", userRole: "meria", userDepartment: "henny" }

  //generates a jwt token

  // 1. Create the stateless token
  const token = jwt.sign(
    {
      userId: userInformation.userId,
      userRole: userInformation.userRole,
      userDepartment: userInformation.userDepartment,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  /**
   *Options for the cookies of JWT
   */
  const cookieOptions = {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    // maxAge: 3600000, // 1 hour
  };

  // We return the response object so you can chain .json()
  return res.cookie("token", token, cookieOptions);
};
