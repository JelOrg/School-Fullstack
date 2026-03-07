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

  req.on("close", () => closeSSESession(res, intervalId));

  //Create a SSE connection, meaning you have an open connection to sever
  const intervalId = setInterval(async () => {
    try {
      //Checks if the session is still valid or active
      lastVerified = await SSESessionCheck(req, res, intervalId, lastVerified);

      //Add a check for jwt.token if valid
      const requestedLimit = Number(req.query.limit || 10);
      const safeLimit = Number.isNaN(requestedLimit)
        ? 10
        : Math.min(Math.max(requestedLimit, 1), 100);

      const userDepartmentName = req.tokenInformation?.userDepartmentName;
      const userAuthLevel = req.userAuthLevel || 1;

      const historyResult = await fetchRecentRequestsHistory({
        userAuthLevel: userAuthLevel,
        userDepartmentName: userDepartmentName,
        limit: safeLimit,
      });

      if (!historyResult.success) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Failed to fetch geschiedenis data",
        });
      }

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: historyResult.message,
        data: historyResult.data,
        count: historyResult.data.length,
      });
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Unexpected error while fetching geschiedenis data",
        error: error.message,
      });
    }
  }, REFRESH_RATES.STANDARD_DASHBOARD);

  req.on("close", () => {
    console.log("Client closed connection. Clearing interval.");
    clearInterval(intervalId);
  });
};
