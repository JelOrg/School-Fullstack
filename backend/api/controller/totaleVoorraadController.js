import {
  fetchKritiekVoorraad,
  fetchMeldingenAlert,
  getCurrentOrNextReqBatchId,
} from "#services/fetchDatabaseInfo";
import { closeSSESession } from "#services/SSEService";
import { processToken, validateToken } from "#services/tokenHandler";
import {
  HTTP_STATUS,
  REFRESH_RATES,
  VERIFY_INTERVAL,
} from "#utils/magicNumberFile";

//TODO TEST THIS, THIS MIGHT BE BUGGY
// ==========================================
// GET: TotaleVoorraad controller
// ==========================================
export const fetchDashboardDisplayData = async (req, res) => {
  //Header for what is needed in the header of a SSE
  SSEHeader(res);
  let lastVerified = Date.now();

  req.on("close", () => closeSSESession(res, intervalId));

  //Create a SSE connection, meaning you have an open connection to sever
  const intervalId = setInterval(async () => {
    try {
      //Checks if the session is still valid or active
      lastVerified = await SSESessionCheck(req, res, intervalId, lastVerified);

      //! This could be the cause for data nor being feteched
      // 2. Fetch data
      const [voorraadData, alertsData] = await Promise.all([
        fetchKritiekVoorraad(
          req.userAuthLevel,
          req.tokenInformation.userDepartmentName,
        ),
        fetchMeldingenAlert(
          req.userAuthLevel,
          req.tokenInformation.userDepartmentName,
        ),
      ]);

      // 3. Send to client
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ voorraadData, alertsData })}\n\n`);
      }
    } catch (err) {
      console.error("Dashboard Stream Error:", err);
    }
  }, REFRESH_RATES.CRITICAL_VITALS);

  req.on("close", () => {
    console.log("Client closed connection. Clearing interval.");
    clearInterval(intervalId);
  });
};
