import { fetchRecentRequestsHistory } from "#services/fetchRequestInfo";
import { HTTP_STATUS, REFRESH_RATES } from "#utils/magicNumberFile";

//GET: returns latest request history rows for geschiedenis page
export const fetchGeschiedenisDisplayData = async (req, res) => {
  res.writeHead(HTTP_STATUS.OK, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache", // Good for SSE
    Connection: "keep-alive",
  });

  const lastVerified = Date.now();

  const intervalId = setInterval(async (req, res) => {
    try {
      if (Date.now() - lastVerified > VERIFY_INTERVAL) {
        //checks if the cookie isn't expired
        const isActive = processToken(req.cookies?.token);

        if (!isActive.success) return closeSSESession(res, intervalId);

        const isValid = await validateToken(isActive.tokenInfo);

        if (!isValid.success) return closeSSESession(res, intervalId);

        lastVerified = Date.now();
      }

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
};
