import { generateToken, processToken } from "#services/tokenHandler";
import { prisma } from "#utils/prismaClient";

//checks if the request has a token and if the token is still valid
export const authenticateToken = async (req, res, next) => {
  //takes in a JWT non mobile token
  const cookieToken = req.cookies?.token;

  //Checks if a token is found
  if (!cookieToken) return res.redirect("/login?error=denied");

  //verifies token and decodes payload
  const processedToken = processToken(cookieToken.token);

  //4. Bad token? Clear it and EXIT then reroutes.
  if (!processedToken.success) {
    res.clearCookie("token");
    return res.redirect("/login?error=denied");
  }

  //Checks if the user is still active in the db, so no bans or such
  const user = await prisma.users
    .findUnique({
      where: {
        userId: processedToken.tokenInfo.userId,
      },
      select: { userId: true, isActive: true },
    })
    .catch((err) => {
      // This will show exactly where it failed in your logs
      err.message = `[Auth DB Check Failed]: ${err.message}`;
      throw err;
    });

  if (!user || !user.hasAccess) {
    res.clearCookie("token");
    return res.redirect("/login?error=denied");
  }

  //attach token payload for authorization middleware
  req.tokenInformation = processedToken.tokenInfo;
  next();
};
