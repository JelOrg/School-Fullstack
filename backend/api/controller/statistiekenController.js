import { fetchRequestStatistics } from "#services/fetchRequestInfo";
import { HTTP_STATUS, REFRESH_RATES } from "#utils/magicNumberFile";

//GET: returns statistics data for statistieken page
export const fetchStatistiekenDisplayData = async (req, res) => {
  try {

    //TODO Add a jwt token check
    //TODO Remove some limits
    const requestedTopLimit = Number(req.query.topLimit || 10);
    const safeTopLimit = Number.isNaN(requestedTopLimit)
      ? 10
      : Math.min(Math.max(requestedTopLimit, 1), 50);

    const userDepartmentName = req.tokenInformation?.userDepartmentName;
    const userAuthLevel = req.userAuthLevel || 1;

    const statisticsResult = await fetchRequestStatistics({
      userAuthLevel: userAuthLevel,
      userDepartmentName: userDepartmentName,
      topLimit: safeTopLimit,
    });

    if (!statisticsResult.success) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch statistieken data",
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: statisticsResult.message,
      refreshRateMs: REFRESH_RATES.CRITICAL_VITALS,
      data: statisticsResult.data,
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unexpected error while fetching statistieken data",
      error: error.message,
    });
  }
};
