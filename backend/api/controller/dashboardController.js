/**
 * ! Will cause race condition, due to multiple user being able to request
 * ! the same item making it possible to see 2 or more different remainingAmount items
 * @param {*} req
 * @param {*} res
 */
export const sendSpoedAanvraag = async (req, res) => {};

export const getKritiekeVoorraad = async (req, res) => {};
export const getMeldingen = async (req, res) => {};
