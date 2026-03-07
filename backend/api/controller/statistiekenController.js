import { fetchRequestStatistics } from "#services/fetchRequestInfo";
import {
  closeSSESession,
  SSEHeader,
  SSESessionCheck,
} from "#services/SSEService";
import { HTTP_STATUS, REFRESH_RATES } from "#utils/magicNumberFile";

//GET: returns statistics data for statistieken page
export const fetchStatistiekenDisplayData = async (req, res) => {
  //Header for what is needed in the header of a SSE
  SSEHeader(res);
  let lastVerified = Date.now();

  req.on("close", () => closeSSESession(res, intervalId));

  //Create a SSE connection, meaning you have an open connection to sever
  const intervalId = setInterval(async () => {
    try {
      //TODO Make this actually have a limit
      //TODO Check if you really need a departmentName for now
      //Checks if the session is still valid or active
      lastVerified = await SSESessionCheck(req, res, intervalId, lastVerified);

      const userDepartmentName = req.tokenInformation?.userDepartmentName;
      const userAuthLevel = req.userAuthLevel || 1;

      const statisticsResult = await fetchRequestStatistics({
        userAuthLevel: userAuthLevel,
        userDepartmentName: userDepartmentName,
        topLimit: safeTopLimit,
      });

      if (!statisticsResult.success)
        return res.write(
          `data: ${JSON.stringify({ success: false, message: "Failed to fetch statistieken data" })}\n\n`,
        );

      res.write(
        `data: ${JSON.stringify({
          success: true,
          message: statisticsResult.message,
          refreshRateMs: REFRESH_RATES.CRITICAL_VITALS,
          data: statisticsResult.data,
        })}\n\n`,
      );
    } catch (error) {
      return res.write(
        `data: ${JSON.stringify({ success: false, message: "Unexpected error while fetching statistieken data", error: error.message })}\n\n`,
      );
    }
  }, REFRESH_RATES.SYSTEM_STATUS);

  req.on("close", () => {
    console.log("Client closed connection. Clearing interval.");
    clearInterval(intervalId);
  });
};
