/**
 * Signs a JWT and attaches it to an HttpOnly cookie.
 * @param {Object} res - The Express response object.
 * @param {Object} user - The user data to encode in the token.
 */

export const sendToken = (res, user) => {
  // We return the response object so you can chain .json() if you want
  return res.cookie("token", token, cookieOptions);
};
