import { fetchUserInfo, validateUserLogin } from "#services/fetchUserInfo";
import { generateToken } from "#services/tokenHandler";
import { cookieOptions } from "#utils/config";

//* importing magic numbers
import { HTTP_STATUS, ONE_HOUR } from "#utils/magicNumberFile";

//TODO CHECK IF THE PASSWORD DECRYPT ACTUALLY WORKS AND THAT THE COOKIE IS SEND
//validates if the user login information is correct
export const validateLogin = async (req, res) => {
  //! userRoleName doens't exist in token, because there is no token...
  const { userRoleName, userEmail, providedPassword } = req.body;

  //checks if there is actually a password or email send
  //! this actually is easy to get past with by inputting false or true
  if (!userEmail || !providedPassword) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "You have to put email or password" });
  }
  //validates that the user is giving the correct role, password, and
  const userLogin = await validateUserLogin(
    userRoleName,
    userEmail,
    providedPassword,
  );

  if (!userLogin.success) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Invalid email or password" });
  }

  //fetches user info
  const userInfo = await fetchUserInfo(userLogin.userId);

  if (!userInfo.success)
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ message: "User account is not found or is not active anymore" });

  //uses user info to create a JWT
  const token = generateToken(
    userInfo.data.userId,
    userInfo.data.roleName,
    userInfo.data.departmentName,
  );

  const jwtToken = token.token;

  // The "Ending": Send the cookie and a success message
  return res
    .status(HTTP_STATUS.OK)
    .cookie("token", jwtToken, cookieOptions)
    .json({
      success: true,
      message: "Login successful",
      redirectTo: "/dashboard",
    });
};
