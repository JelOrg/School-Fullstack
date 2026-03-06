import {
  fetchKritiekVoorraad,
  fetchMeldingenAlert,
  getCurrentOrNextReqBatchId,
} from "#services/fetchDatabaseInfo";
import { postToRequestTable, postRequestDescription } from "#services/postInfoToDatabase";
import { processToken, validateToken } from "#services/tokenHandler";
import {
  HTTP_STATUS,
  REFRESH_RATES,
  VERIFY_INTERVAL,
} from "#utils/magicNumberFile";

// ==========================================
// POST: Create Urgent Request
// ==========================================
//TODO TEST ALSO
//? Sends a spoedaanvraag to the db
//! Will cause race condition, due to multiple users being able to request
//! the same item making it possible to see 2 or more different remainingAmount items
/**
 * @param {*} req
 * @param {*} res
 */
export const sendSpoedAanvraag = async (req, res) => {
  const { itemInfo, departmentName, textField } = req.body;

  // userId comes from the verified JWT token — NOT from req.body
  // req.tokenInformation is set by authenticateToken middleware
  const userId = req.tokenInformation?.userId;

  if (!itemInfo || itemInfo.length === 0 || !departmentName)
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "You have to enter an item and department",
    });

  if (!userId)
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid session — please log in again",
    });

  // Get next batch ID
  const batchResult = await getCurrentOrNextReqBatchId(true);
  if (!batchResult.succes)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to contact DB" });

  const requestBatchId = batchResult.data;

  // Save optional text description to its own table
  if (textField) {
    await postRequestDescription(textField).catch(() => {
      // Non-fatal — log but continue
      console.warn("Could not save request description");
    });
  }

  // Schema: request has requestBatchId, itemId, requestedAmount, userId
  // departmentId is NOT on the request table (it's on the user)
  const requestedItemsList = itemInfo.map((item) => ({
    itemId: item.itemId,
    requestedAmount: item.amountRequested,
    userId: userId,
    requestBatchId: requestBatchId,
  }));

  const postingToDb = await postToRequestTable(requestedItemsList);

  if (!postingToDb.success)
    return res.status(HTTP_STATUS.BAD_REQUEST)
      .json({ success: false, message: postingToDb.message });

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Spoedaanvraag successfully created!",
    count: postingToDb.count,
  });
};

//TODO TEST THIS, THIS MIGHT BE BUGGY
// ==========================================
// GET: Data for the dashboard. Creates a constant connection to db
// ==========================================
//? kritieke voorraad controllers
//? meldingen controller
//? Spoedaanvraag controller
export const fetchDashboardDisplayData = async (req, res) => {
  res.writeHead(HTTP_STATUS.OK, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache", // Good for SSE
    Connection: "keep-alive",
  });

  let lastVerified = Date.now();

  const intervalId = setInterval(async () => {
    try {
      // 1. TRIGGER: Periodic Security Check (Every 5 mins)
      if (Date.now() - lastVerified > VERIFY_INTERVAL) {
        //TODO NEED TO MAKE THIS validate if the token is exactly like what is stored in the db
        const isValid = await validateToken();
        if (!isValid.success) {
        }
        lastVerified = Date.now();
      }

      // 2. Fetch both (using the names you defined)
      const [voorraadData, alertsData] = await Promise.all([
        fetchKritiekVoorraad(
          req.userAuthLevel,
          req.tokenInfo.userDepartmentName,
        ),
        fetchMeldingenAlert(
          req.userAuthLevel,
          req.tokenInfo.userDepartmentName,
        ),
      ]);

      // 3. Send combined JSON (Note: sanitized names match the fetch above)
      // Change step 3 to this:
      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            voorraadData: voorraadData,
            alertsData: alertsData,
          })}\n\n`,
        );
      }
    } catch (err) {
      console.error("Dashboard Stream Error:", err);
      // Optional: send a 'retry' or 'error' event to the client
    }
  }, REFRESH_RATES.CRITICAL_VITALS);

  req.on("close", () => {
    console.log("Client closed connection. Clearing interval.");
    clearInterval(intervalId);
  });
};