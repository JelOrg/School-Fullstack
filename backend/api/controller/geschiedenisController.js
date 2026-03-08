import { fetchRecentRequestsHistory } from "#services/fetchRequestInfo";
import {
  closeSSESession,
  SSEHeader,
  SSESessionCheck,
} from "#services/SSEService";
import { HTTP_STATUS, REFRESH_RATES } from "#utils/magicNumberFile";

//GET: returns latest request history rows for geschiedenis page
export const fetchGeschiedenisDisplayData = async (req, res) => {
  //Header for what is needed in the header of a SSE
  SSEHeader(res);
  let lastVerified = Date.now();

  //Create a SSE connection, meaning you have an open connection to sever
  const intervalId = setInterval(async () => {
    try {
      lastVerified = await SSESessionCheck(req, res, intervalId, lastVerified);

      const requestedLimit = Number(req.query.limit || 10);
      const safeLimit = Number.isNaN(requestedLimit)
        ? 10
        : Math.min(Math.max(requestedLimit, 1), 100);

      const DepartmentName = req.tokenInformation?.DepartmentName;
      const userAuthLevel = req.userAuthLevel;

      const historyResult = await fetchRecentRequestsHistory({
        AuthLevel: userAuthLevel,
        DepartmentName: DepartmentName,
        limit: safeLimit,
      });

      if (!historyResult.success) {
        res.write(
          `data: ${JSON.stringify({
            success: false,
            message: "Failed to fetch geschiedenis data",
          })}\n\n`,
        );
        return; // stop this interval tick, but keep connection alive
      }

      res.write(
        `data: ${JSON.stringify({
          success: true,
          message: historyResult.message,
          data: historyResult.data,
          count: historyResult.data.length,
        })}\n\n`,
      );
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          success: false,
          message: "Unexpected error while fetching geschiedenis data",
          error: error.message,
        })}\n\n`,
      );
      // don't close connection on every error unless it's unrecoverable
    }
  }, REFRESH_RATES.STANDARD_DASHBOARD);

  req.on("close", () => {
    console.log("Client closed connection. Clearing interval.");
    clearInterval(intervalId);
  });
};
