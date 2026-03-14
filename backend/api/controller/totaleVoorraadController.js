import { fetchAllItems } from "#services/fetchItemInfo";
import {
  closeSSESession,
  SSEHeader,
  SSESessionCheck,
} from "#services/SSEService";
import { REFRESH_RATES } from "#utils/magicNumberFile";

//TODO TEST THIS, THIS MIGHT BE BUGGY
// ==========================================
// GET: TotaleVoorraad controller
// ==========================================
export const fetchTotalVoorraadData = async (req, res) => {
  //Header for what is needed in the header of a SSE
  SSEHeader(res);
  let lastVerified = Date.now();

  //Create a SSE connection, meaning you have an open connection to sever
  const intervalId = setInterval(async () => {
    try {
      //Checks if the session is still valid or active
      const isValid = await SSESessionCheck(req, res, intervalId, lastVerified);

      if (!isValid.success) {
        return res.write(
          `data: ${JSON.stringify({ success: false, message: "Session error?" })}\n\n`,
        );
      }

      lastVerified = isValid.lastVerified;

      // 2. Fetch data
      const voorraadObject = await fetchAllItems();

      const voorraadData = voorraadObject.data;

      // 3. Send to client
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(voorraadData)}\n\n`);
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
