import { HTTP_STATUS, VERIFY_INTERVAL } from "#utils/magicNumberFile";
import { processToken, validateToken } from "#services/tokenHandler";

/**
 * CLoses SSE session
 */
export const closeSSESession = (res, intervalId) => {
  // 1. Check if we can still talk to the client
  if (!res.writableEnded) {
    res.write("event: auth_error\n");
    res.write(
      `data: ${JSON.stringify({ url: "/api/login/logout?session=expired" })}\n\n`,
    );
    res.end();
  }

  // 2. Kill the timer (Always do this, even if the response is already ended)
  if (intervalId) {
    clearInterval(intervalId);
  }

  // 3. Return for logging/debugging purposes
  return {
    success: false,
    message: "SSE session closed and interval cleared",
  };
};

export const SSEHeader = (res) => {
  res.writeHead(HTTP_STATUS.OK, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache", // Good for SSE
    Connection: "keep-alive",
  });
};

/**
 * COMBINED SSE SERVICE with token verify and closing service
 * @param {*} req
 * @param {*} res
 * @param {*} intervalId
 * @param {*} lastVerified
 * @returns
 */
export const SSESessionCheck = async (req, res, intervalId, lastVerified) => {
  if (Date.now() - lastVerified > VERIFY_INTERVAL) {
    //checks if the cookie isn't expired
    const isActive = processToken(req.cookies?.token);

    if (!isActive.success) return closeSSESession(res, intervalId);

    const isValid = await validateToken(isActive.tokenInfo);

    if (!isValid.success) return closeSSESession(res, intervalId);

    return (lastVerified = Date.now());
  }
};
