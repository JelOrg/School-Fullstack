//Generates a token
import "#utils/absoluteEnvPath";
import jwt from "jsonwebtoken";

//What fomat of data needs to be inserted into the userInformation params
//? { userId: "bob", userRole: "meria", userDepartment: "henny" }

//generates a jwt token
export function generateToken(userInformation) {
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
  return token;
}
