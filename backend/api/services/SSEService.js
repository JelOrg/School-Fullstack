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
