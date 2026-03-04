import { fetchUserInfo, validateUserLogin } from "#services/fetchUserInfo";
import { generateToken } from "#services/tokenHandler";

//validates if the user login information is correct
export const validateLogin = async (req, res) => {
  //what i want to get out of the body of the req.body
  const { userRoleName, userEmail, providedPassword } = req.body;

  //checks if there is actually a password or email send
  // TODO this actually is easy to get past with by inputting false or true
  if (!userEmail || !providedPassword) {
    return res
      .status(400)
      .json({ message: "You have to put email or password" });
  }
  //validates that the user is giving the correct role, password, and
  const userLogin = await validateUserLogin(
    userRoleName,
    userEmail,
    providedPassword,
  );

  if (!userLogin.success) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  //fetches user info
  const userInfo = await fetchUserInfo(userLogin.userId);

  //uses user info to create a JWT
  const token = generateToken(
    userInfo.userId,
    userInfo.roleName,
    userInfo.departmentName,
  );

  // * could be placed somewhere else
  const ONE_HOUR = 3600000; // 1 * 60 * 60 * 1000
  //*=================

  //! prob security issues
  //Some extras so the client know what with the cookie
  const cookieOptions = {
    maxAge: ONE_HOUR,
    // httpOnly: true,
    // sameSite: "strict",
    // secure: process.env.NODE_ENV === "production",
  };

  // The "Ending": Send the cookie and a success message
  return res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    message: "Login successful",
    redirectTo: "/dashboard",
  });
};
