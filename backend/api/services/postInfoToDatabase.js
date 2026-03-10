import { prisma } from "#utils/prismaClient";

/**
 * Send spoedaanvraag to the DB
 * Sends a few post to the db depending on the amount of items in the list
 */
export const postToRequestTable = async (requestItemsList) => {
  // Ensure dataToInsert is always an array regardless of input shape
  const dataToInsert = Array.isArray(requestItemsList)
    ? requestItemsList
    : [requestItemsList];

  const sendPost = await prisma.request
    .createMany({
      data: dataToInsert,
    })
    .catch((err) => {
      err.message = `[Sending request to table]: ${err.message}`;
      throw err;
    });

  if (sendPost.count === 0)
    return { success: false, message: "Nothing has been posted for request?" };

  return { success: true, message: "Posted data to the db" };
};
