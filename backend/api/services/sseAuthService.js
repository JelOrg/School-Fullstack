import { processToken } from "./tokenHandler";

/**
 * Standard Security Guard for all SSE Streams
 * Handles validation and automated client redirection
 */
export const verifySSESession = async (req, res, intervalId) => {
  // 1. Process the token
  const isActive = processToken(req.cookies?.token);

  // 2. Validate against DB (only if processToken succeeded)
  const isValid = isActive.success
    ? await validateToken(isActive.tokenInfo)
    : { success: false };

  // 3. The "Standard" Action
  if (!isActive.success || !isValid.success) {
    // Clear the loop to prevent memory leaks
    if (intervalId) clearInterval(intervalId);

    // Send the specific signal the frontend is listening for
    res.write("event: auth_error\n");
    res.write(
      `data: ${JSON.stringify({ url: "/api/auth/logout?session=expired" })}\n\n`,
    );

    res.end();
    return false; // Validation failed
  }

  return true; // Validation passed
};
