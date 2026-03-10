import { fetchUserAanvragen } from "#services/fetchRequestInfo";
import {
  closeSSESession,
  SSEHeader,
  SSESessionCheck,
} from "#services/SSEService";
import { HTTP_STATUS, REFRESH_RATES } from "#utils/magicNumberFile";

// ==========================================
// GET: SSE endpoint that streams the user's aanvragen to the frontend
// ==========================================
/**
 * Opens a Server-Sent Events connection and periodically sends
 * the latest aanvragen (requests) for the authenticated user.
 * Managers/admins see all requests; employees see only their own.
 *
 * Query params:
 *   ?limit=20  — max rows to return (clamped 1–100, default 20)
 *
 * Relies on:
 *   - req.tokenInformation  (set by authenticateToken middleware)
 *   - req.userAuthLevel     (set by authorizeUser middleware)
 */
export const fetchAanvragenDisplayData = async (req, res) => {
  //Set the SSE headers so the browser knows this is an event stream
  SSEHeader(res);
  let lastVerified = Date.now();

  //Open SSE connection: runs the callback on a fixed interval
  const intervalId = setInterval(async () => {
    try {
      //Re-verify the JWT token periodically to close stale sessions
      const isValid = await SSESessionCheck(req, res, intervalId, lastVerified);

      if (!isValid.success) {
        return res.write(
          `data: ${JSON.stringify({ success: false, message: "Session error?" })}\n\n`,
        );
      }

      lastVerified = isValid.lastVerified;

      const userDepartmentName = req.tokenInformation?.userDepartmentName;
      const userId = req.tokenInformation?.userId;
      const userAuthLevel = req.userAuthLevel || 1;

      //Clamp the requested limit between 1 and 100 to prevent abuse
      const requestedLimit = Number(req.query.limit || 20);
      const safeLimit = Number.isNaN(requestedLimit)
        ? 20
        : Math.min(Math.max(requestedLimit, 1), 100);

      //Fetch aanvragen from the database, scoped by auth level
      const aanvragenResult = await fetchUserAanvragen({
        userAuthLevel: userAuthLevel,
        userDepartmentName: userDepartmentName,
        userId: userId,
        limit: safeLimit,
      });

      if (!aanvragenResult.success) {
        res.write(
          `data: ${JSON.stringify({
            success: false,
            message: "Failed to fetch aanvragen data",
          })}\n\n`,
        );
        return;
      }

      //Send the aanvragen data to the client
      res.write(
        `data: ${JSON.stringify({
          success: true,
          message: aanvragenResult.message,
          refreshRateMs: REFRESH_RATES.STANDARD_DASHBOARD,
          data: aanvragenResult.data,
          count: aanvragenResult.data.length,
        })}\n\n`,
      );
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          success: false,
          message: "Unexpected error while fetching aanvragen data",
          error: error.message,
        })}\n\n`,
      );
    }
  }, REFRESH_RATES.STANDARD_DASHBOARD);

  //Clean up the interval when the client disconnects
  req.on("close", () => {
    console.log("Client closed aanvragen SSE connection. Clearing interval.");
    clearInterval(intervalId);
  });
};
