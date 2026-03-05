import { processToken } from "#services/tokenHandler";
import { generateToken } from "#services/tokenHandler";

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
  const processedToken = processToken(cookieToken.token);

  //4. Bad token? Clear it and EXIT then reroutes.
  if (!processedToken.success) {
    res.clearCookie("token");
    return res.redirect("/login");
  }

  //TODO make a db check on userId(PK) and the other 2 things to see if the user exists,
  //TODO or we can have a special column for they have access to the site

  //attach token payload for authorization middleware
  req.tokenInformation = processedToken.tokenInfo;
  next();
};
