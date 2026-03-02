/**
 * Signs a JWT and attaches it to an HttpOnly cookie.
 * @param {Object} res - The Express response object.
 * @param {Object} user - The user data to encode in the token.
 */

import jwt from "jsonwebtoken";

export const sendToken = (res, user) => {
  // 1. Create the stateless token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // 2. Setup Cookie Options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 3600000, // 1 hour
  };

  console.log(token);
  // 3. Attach to response and send
  // We return the response object so you can chain .json() if you want
  return res.cookie("token", token, cookieOptions);
};
