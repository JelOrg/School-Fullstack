import { fetchUserInfo, validateUserLogin } from "#services/fetchUserInfo";
import { generateToken } from "#services/tokenHandler";

//validates if the user login information is correct
const validateLogin = async (req, res) => {
  try {
    //what i want to get out of the body of the req.body
    const { userRole, userEmail, providedPassword } = req.body;

    //checks if there is actually a password or email send
    if (!userEmail || !providedPassword) {
      return res
        .status(400)
        .json({ success: false, message: "You have to put email or password" });
    }

    //validates that the user is giving the correct role, password, and
    const userLogin = await validateUserLogin(
      userRole,
      userEmail,
      providedPassword,
    );

    if (!userLogin.success) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    //fetches user info
    const userInfo = await fetchUserInfo({ userId: userLogin.userId });
    if (!userInfo?.success) {
      return res.status(404).json({
        success: false,
        message: "User information could not be found",
      });
    }

    //uses user info to create a JWT
    const generatedToken = generateToken(
      userInfo.userId,
      userInfo.roleName,
      userInfo.departmentName,
      userInfo.firstName,
      userInfo.lastName,
    );

    //extra check: token generator should always return success true
    if (!generatedToken.success || !generatedToken.token) {
      return res.status(500).json({
        success: false,
        message: "Token could not be created",
      });
    }

    const ONE_HOUR = 3600000; // 1 * 60 * 60 * 1000

    const cookieOptions = {
      maxAge: ONE_HOUR,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    };

    // The "Ending": Send the cookie and a success message
    return res
      .status(200)
      .cookie("token", generatedToken.token, cookieOptions)
      .json({
        success: true,
        message: "Login successful",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while logging in",
      error: error.message,
    });
  }
};

export { validateLogin };
