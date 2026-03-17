import { fetchRequestHistory } from "#services/fetchRequestInfo";
import { SSEHeader, SSESessionCheck } from "#services/SSEService";
import {
  DEFAULT_AUTH_LEVEL,
  HTTP_STATUS,
  REFRESH_RATES,
  TAKE_LIMIT_GESCHIEDENIS_REQUEST,
} from "#utils/magicNumberFile";

//GET: returns latest request history rows for geschiedenis page
export const fetchGeschiedenisDisplayData = async (req, res) => {
  //Header for what is needed in the header of a SSE
  SSEHeader(res);

  let lastVerified = Date.now();

  //Create a SSE connection, meaning you have an open connection to sever
  const intervalId = setInterval(async () => {
    try {
      //Checks if the session is still valid or active
      const isValid = await SSESessionCheck(lastVerified);

      if (!isValid.success) {
        closeSSESession(res, intervalId);
        return { message: "Session Is expired" };
      }

      const userDepartmentName = req.tokenInformation?.userDepartmentName;
      const userAuthLevel = req.userAuthLevel || DEFAULT_AUTH_LEVEL;

      //Fetch the request history from the database, scoped by auth level and department
      const historyResult = await fetchRequestHistory({
        userAuthLevel: userAuthLevel,
        userDepartmentName: userDepartmentName,
        limit: TAKE_LIMIT_GESCHIEDENIS_REQUEST,
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

      const historyData = historyResult.data;
      res.write(`data: ${JSON.stringify({ historyData })}\n\n`);

      //===
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
