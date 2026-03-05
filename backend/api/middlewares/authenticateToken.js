import { processToken } from "#services/tokenHandler";

// TODO FIle CAN be Rewritten
//checks if the request has a token and if the token is still valid
export const authenticateToken = (req, res, next) => {
  //takes in a JWT non mobile token
  const cookieToken = req.cookies?.token;

  //Checks if a token is found
  if (!cookieToken) {
    // redirect if there is no token
    return res.redirect("/login");
  }

  //verifies token and decodes payload
  const processedToken = processToken(cookieToken);

  // 4. Bad token? Clear it and EXIT then reroutes.
  if (!processedToken.success) {
    res.clearCookie("token");
    return res.redirect("/login");
  }

  //attach token payload for authorization middleware
  req.tokenInformation = processedToken.tokenInfo;

  next();
};
