import { processToken } from "#services/tokenHandler";

// TODO FIle CAN be Rewritten
//checks if the request has a token and if the token is still valid
export const authenticateToken = (req, res, next) => {
  //supports token from cookie and fallback from Bearer header
  //Bit 
  const cookieToken = req.cookies?.token;

  // TODO authorization header shouldn't be inside the authentication middleware
  const authHeader = req.headers.authorization;
  
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const userToken = cookieToken || bearerToken;

  //if there is no token, we treat the user as unauthenticated
  if (!userToken) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: token is missing",
      });
    }
    return res.redirect("/login");
  }

  //verifies token and decodes payload
  const processedToken = processToken(userToken);
  if (!processedToken.success) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: token is invalid or expired",
      });
    }
    return res.redirect("/login");
  }

  //attach token payload for authorization middleware
  req.user = processedToken.tokenInfo;
  next();
};

//if user is already logged in, avoid showing login page again
export const requireGuest = (req, res, next) => {
  const userToken = req.cookies?.token;
  if (!userToken) return next();

  const processedToken = processToken(userToken);
  if (!processedToken.success) return next();

  return res.redirect("/dashboard");
};
