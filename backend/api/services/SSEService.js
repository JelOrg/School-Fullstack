import { HTTP_STATUS, VERIFY_INTERVAL } from "#utils/magicNumberFile";
import { processToken, validateToken } from "#services/tokenHandler";

/**
 * CLoses SSE session
 */
export const closeSSESession = (res, intervalId) => {
  // 1. Check if we can still talk to the client
  if (!res.writableEnded) {
    res.write("event: auth_error\n");
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

/**
 *
 * SSE HEADER???
 * @param {*} res
 */
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
export const SSESessionCheck = async (lastVerified) => {
  if (Date.now() - lastVerified > VERIFY_INTERVAL) {
    return { success: false, message: "Time is expired" };
  }
  return { success: true, lastVerified, message: "Time is not expired" };
};
