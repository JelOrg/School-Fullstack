import { ONE_HOUR } from "#utils/magicNumberFile";

//Config options for cookies
export const cookieOptions = {
  maxAge: ONE_HOUR,
  path: "/",
  // httpOnly: true,
  // sameSite: "strict",
  // secure: process.env.NODE_ENV === "production",
};
