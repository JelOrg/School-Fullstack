import { prisma } from "#utils/prismaClient";

/**
 * Send spoedaanvraag to the DB
 * Sends a few post to the db depending on the amount of items in the list
 */
export const postToRequestTable = async (requestItemsList) => {
  const sendPost = await prisma.request.createMany({
    data: requestItemsList,
  });

  if (sendPost.count === 0)
    return { success: false, message: "Nothing has been posted for request?" };

  return { success: true, message: "Posted data to the db" };
};
