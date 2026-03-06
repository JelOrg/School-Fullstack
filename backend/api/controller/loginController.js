import { fetchUserInfo, validateUserLogin } from "#services/fetchUserInfo";
import { generateToken } from "#services/tokenHandler";

//* importing magic numbers
import { HTTP_STATUS, ONE_HOUR } from "#utils/magicNumberFile";

//TODO CHECK IF THE PASSWORD DECRYPT ACTUALLY WORKS AND THAT THE COOKIE IS SEND
//validates if the user login information is correct
export const validateLogin = async (req, res) => {
  //what i want to get out of the body of the req.body
  const { userRoleName, userEmail, providedPassword } = req.body;

  //checks if there is actually a password or email send
  // TODO this actually is easy to get past with by inputting false or true
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

  if (!userInfo.data.isActive)
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ message: "User account is not active anymore" });

  //uses user info to create a JWT
  const token = generateToken(
    userInfo.userId,
    userInfo.roleName,
    userInfo.departmentName,
  );

  //! prob security issues
  //TODO CHeck if this actually works
  //Some extras so the client know what with the cookie

  // The "Ending": Send the cookie and a success message
  return res.status(HTTP_STATUS.OK).cookie("token", token, cookieOptions).json({
    success: true,
    message: "Login successful",
    redirectTo: "/dashboard",
  });
};
