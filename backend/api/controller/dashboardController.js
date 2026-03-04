import {} from "#services/postInfoDatabase";
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
  // ! Test to see if the itemInfo can have multiple data objects
  // ! Maybe we need to get Department by JWT? or we can put manually if needed
  const { itemInfo, departmentName, textField } = req.body;

  // ! not sure of itemInfo or departmentName will show get alway be true
  if (!itemInfo || !departmentName)
    return res.status(401).json({ message: "You have to enter a item" });

  // TODO process itemInfo, since you can ask for multiple
  //* Call a post service
};

//? kritieke voorraad controllers
export const getKritiekeVoorraad = async (req, res) => {};

//? meldingen controller
export const getMeldingen = async (req, res) => {};
