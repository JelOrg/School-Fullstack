import { postSpoedAanvraag } from "#services/postInfoToDatabase";
import { fetchCrucialItemInfo, fetchAllItems } from "#services/fetchItemInfo";
import { getCurrentOrNextReqBatchId } from "#services/fetchDatabaseInfo";
import { fetchDepartmentId } from "#services/fetchDepartmentData";

//? Spoedaanvraag controller
export const displaySpoedAanvraagData = async (req, res) => {};

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

  if (!userId) return { success: false, message: "Some JWT error" };

  // !Might count incorrectly depending on some bug, since we aren't checking anything else
  // * but prob not a problem, since we are searching for the highest int of batchId

  //Get a request batch id, so +1 from the latest batchId
  const requestBatchId = await getCurrentOrNextReqBatchId(true);

  // ! Users can still submit even if stock changed since their last fetch.
  // TODO: Add a real-time stock check against the DB before saving.
  // TODO: Filter out items that are no longer available.

  /** * Formats raw input into a clean list for processing:
   * Example: [ { itemId: 101, itemName: "Hammer", requestedAmount: 2 },
   * {itemId: something, itemName: somethingelse, requestedAmount: again} ]
   */
  const requestedItemsList = itemInfo.map((item) => ({
    itemId: item.itemId,
    itemName: item.nameItem,
    requestedAmount: item.amountRequested,
  }));

  //Gets you the departmentId
  const departmentId = await fetchDepartmentId(departmentName);

  // TODO need to change the db so it can take in more things

  //* Sends the post request to the db
  postSpoedAanvraag(
    userId,
    requestBatchId,
    requestedItemsList,
    departmentId,
    textField,
    getCurrentOrNextReqBatchId(true),
  );
};

//? kritieke voorraad controllers
export const getKritiekeVoorraad = async (req, res) => {};

//? meldingen controller
export const getMeldingen = async (req, res) => {};
