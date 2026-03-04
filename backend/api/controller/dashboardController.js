import {} from "#services/postInfoToDatabase";
import { fetchCrucialItemInfo, fetchAllItems } from "#services/fetchItemInfo";

//? Spoedaanvraag controller
export const displaySpoedAanvraagData = async (req, res) => {};

/**
 * ! Will cause race condition, due to multiple user being able to request
 * ! the same item making it possible to see 2 or more different remainingAmount items
 * @param {*} req
 * @param {*} res
 */
export const sendSpoedAanvraag = async (req, res) => {
  //* The info from the spoedaanvraag form needs to be put into the database
  const { itemInfo, departmentName, textField } = req.body;

  //Migh have weird js behaviour
  if (!itemInfo || itemInfo.length === 0 || !departmentName)
    return res
      .status(401)
      .json({ message: "You have to enter a item or department" });

  //Since the itemInto can return multiple things, we use map to get all of them back
  /** what whould be returned...
   * [
  { id: 101, name: "Hammer", qty: 2 },
  { id: 102, name: "Nails", qty: 50 }
    ]
   */
  const processedItems = itemInfo.map((item) => ({
    itemId: item.itemId,
    itemName: item.nameItem,
    requestedAmount: item.amountRequested,
  }));

  const responseData = {};

  // TODO process itemInfo, since you can ask for multiple
  //* Call a post service
};

//? kritieke voorraad controllers
export const getKritiekeVoorraad = async (req, res) => {};

//? meldingen controller
export const getMeldingen = async (req, res) => {};
