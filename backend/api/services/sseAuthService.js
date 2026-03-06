import { processToken, validateToken } from "#services/tokenHandler";

/**
 * Standard Security Guard for all SSE Streams
 * Handles validation and automated client redirection
 */
export const verifySSESession = async (req, res, intervalId) => {
  // 1. Process the token
  const isActive = processToken(req.cookies?.token);

  // 2. Validate against DB (only if processToken succeeded)
  if (!isActive.success) return { success: false, message: "User is expired" };

  const tokenValidation = await validateToken(isActive.tokenInfo);
  if (!tokenValidation.success) {
    // 3. Clean up and close the SSE connection
    if (intervalId) clearInterval(intervalId); // Prevent memory leaks
    res.write("event: auth_error\n");
    res.write(
      `data: ${JSON.stringify({ url: "/api/auth/logout?session=expired" })}\n\n`,
    );
    res.end();
    return {
      success: false,
      message:
        "User credentials are incorrect or account is not active anymore",
    };
  }
  return { success: true, message: "Session is valid" };
};
