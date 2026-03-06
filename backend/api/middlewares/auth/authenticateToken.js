import { processToken, validateToken } from "#services/tokenHandler";

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
    res.clearCookie("token", { ...cookieOptions });
    return res.redirect("/login?error=denied");
  }

  const isValid = await validateToken(processedToken.tokenInfo);

  if (!isValid.success) {
    res.clearCookie("token", { ...cookieOptions });
    return res.redirect("/login?error=denied");
  }

  //attachsss token payload for authorization middleware
  req.tokenInformation = processedToken.tokenInfo;
  next();
};

// TODO Actually have a way to autoredirect the user to dashboarrd if they acutally have a valid JWT Token
export const isGuest = (req, res, next) => {
  if (req.cookies && req.cookies.authToken) {
    return res.redirect("/dashboard"); // Kick to dashboard
  }
  next(); // No token? Carry on to the Login screen.
};
