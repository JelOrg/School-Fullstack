import { getCurrentOrNextReqBatchId } from "#services/fetchDatabaseInfo";
import { fetchDepartmentId } from "#services/fetchDepartmentData";
import { postToRequestTable } from "#services/postInfoToDatabase";

// ==========================================
// GET:
// ==========================================
//? Spoedaanvraag controller
export const displaySpoedAanvraagData = async (req, res) => {};

// ==========================================
// POST: Create Urgent Request
// ==========================================
//? Sends a spoedaanvraag to the db
//! Will cause race condition, due to multiple users being able to request
//! the same item making it possible to see 2 or more different remainingAmount items
/**
 * @param {*} req
 * @param {*} res
 */
export const sendSpoedAanvraag = async (req, res) => {
  //* The info from the spoedaanvraag form needs to be put into the database
  const { userId, itemInfo, departmentName, textField } = req.body;

  //! Might have weird js behaviour

  //checking for any non gotten data
  if (!itemInfo || itemInfo.length === 0 || !departmentName)
    return res.status(401).json({
      success: false,
      message: "You have to enter a item or department",
    });

  // Inside the Controller
  if (!userId)
    return res.status(401).json({
      success: false,
      message: "Invalid session/Invalid JWT decoding",
    });

  // !Might count incorrectly depending on some weird race condition
  // * but prob not a problem, since we are searching for the highest int of batchId

  //Get a request batch id, so +1 from the latest batchId
  const requestBatchId = await getCurrentOrNextReqBatchId(true);

  if (!requestBatchId)
    return res
      .status(500)
      .json({ success: false, message: "Failed to Contact DB" });

  //Gets you the departmentId
  const departmentId = await fetchDepartmentId(departmentName);

  //quick check that we actually have departmentId
  if (!departmentId.success)
    return res.status(404).json({ message: "Department not found" });

  // ! Users can still submit even if stock changed since their last fetch.
  // TODO: Add a real-time stock check against the DB before saving.
  // TODO: Filter out items that are no longer available.

  // TODO need to change the db so it can store store Text that is send in the Spoedaanvraag
  /** * Formats raw input into a clean list for processing:
   * Example: [ { itemId: 101, itemName: "Hammer", requestedAmount: 2 },
   * {itemId: something, itemName: somethingelse, requestedAmount: again} ]
   */
  const requestedItemsList = itemInfo.map((item) => ({
    itemId: item.itemId,
    itemName: item.nameItem,
    requestedAmount: item.amountRequested,

    //Constants
    userId: userId,
    requestBatchId: requestBatchId,
    departmentId: departmentId,
  }));

  //* Sends the post request to the db
  const postingToDb = await postToRequestTable(requestedItemsList);

  //checks if the posting is successful
  if (!postingToDb.success)
    return res.status(400).json({ message: postingToDb.message });

  // Finish with detail
  return res.status(201).json({
    success: true,
    message: "Spoedaanvraag successfully created!",
    count: postingToDb.count, // if your service returned the count
  });
};

// ==========================================
// GET:
// ==========================================
//? kritieke voorraad controllers
export const getKritiekeVoorraad = async (req, res) => {};

// ==========================================
// GET:
// ==========================================
//? meldingen controller
export const getMeldingen = async (req, res) => {};
