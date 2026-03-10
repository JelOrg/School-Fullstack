import {
  fetchKritiekeVoorraad,
  getCurrentOrNextReqBatchId,
} from "#services/fetchDatabaseInfo";
import { fetchDepartmentId } from "#services/fetchDepartmentData";
import { fetchUrgentRequest } from "#services/fetchRequestInfo";
import { postToRequestTable } from "#services/postInfoToDatabase";
import {
  closeSSESession,
  SSEHeader,
  SSESessionCheck,
} from "#services/SSEService";
import {
  HTTP_STATUS,
  REFRESH_RATES,
  TAKE_LIMIT,
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
  //TODO ADD A THING TO THE DB THAT IS LIKE idURGENT to signify that the req is urgent
  //TODO The info from the spoedaanvraag form needs to be put into the database
  //* Item info is send as an object, needs to hold itemId, itemName, and amount requested
  const { itemInfo, textField } = req.body;
  const { userId, departmentName } = req.tokenInformation;

  //! Might have weird js behaviour

  //checking for any non gotten data
  if (!itemInfo || itemInfo.length === 0)
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "You have to enter a item or department",
    });

  // Inside the Controller
  if (!userId || !departmentName)
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Invalid session/Invalid JWT decoding",
    });

  // !Might count incorrectly depending on some weird race condition
  // * but prob not a problem, since we are searching for the highest int of batchId

  //Get a request batch id, so +1 from the latest batchId
  const requestBatchId = await getCurrentOrNextReqBatchId(true);

  if (!requestBatchId.success)
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to Contact DB" });

  //Gets you the departmentId
  const departmentId = await fetchDepartmentId(departmentName);

  //quick check that we actually have departmentId
  //! can be bugged?
  if (!departmentId.success || !departmentId.data?.departmentId)
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Department not found" });

  // ! Users can still submit even if stock changed since their last fetch.
  // TODO: Add a real-time stock check against the DB before saving.
  // TODO: Filter out items that are no longer available.

  //TODO This doesn't get the itemId from body, or we can have those linked to what is shown on the frontend
  // TODO need to change the db so it can store store Text that is send in the Spoedaanvraag
  /** * Formats raw input into a clean list for processing:
   * Example: [ { itemId: 101, itemName: "Hammer", requestedAmount: 2 },
   * {itemId: something, itemName: somethingelse, requestedAmount: again} ]
   */
  const requestedItemsList = itemInfo.map((item) => ({
    itemId: item.itemId,
    //?Possible to add itemName?
    // itemName: item.nameItem,
    requestedAmount: item.amountRequested,
    requestBatchId: requestBatchId,
    isUrgent: true,

    //Constants
    userId: userId,
    departmentId: departmentId.data.departmentId,
  }));

  //* Sends the post request to the db
  const postingToDb = await postToRequestTable(requestedItemsList);

  //checks if the posting is successful
  if (!postingToDb.success)
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: postingToDb.message });

  // Finish with detail
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Spoedaanvraag successfully created!",
    count: postingToDb.count, // if your service returned the count
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
  //Header for what is needed in the header of a SSE
  SSEHeader(res);
  let lastVerified = Date.now();

  req.on("close", () => closeSSESession(res, intervalId));

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

      //TODO Need to check if you really need department name? or we could just not use it for now
      //! This could be the cause for data nor being feteched
      // 2. Fetch data
      const [voorraadData, alertsData] = await Promise.all([
        fetchKritiekeVoorraad(
          req.userAuthLevel,
          req.tokenInformation.userDepartmentName,
        ),
        fetchUrgentRequest(
          req.userAuthLevel,
          req.tokenInformation.userDepartmentName,
        ),
      ]);

      const kritiekeVoorraadData = voorraadData.data;
      const spoedAanvraagenData = alertsData.data;

      // 3. Send to client
      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({ kritiekeVoorraadData, spoedAanvraagenData })}\n\n`,
        );
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
