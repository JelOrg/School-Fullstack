import { prisma } from "#utils/prismaClient";

/**
 * Send spoedaanvraag to the DB
 * Schema: request { requestId, requestBatchId, itemId, requestedAmount, requestedDate, userId }
 * NOTE: departmentId is NOT on the request table — it lives on the user.
 *       description/textField goes to reqDescirptions table separately.
 */
export const postToRequestTable = async (requestItemsList) => {
  // Map incoming list to only the fields the schema actually has
  const data = requestItemsList.map((item) => ({
    requestBatchId: item.requestBatchId,
    itemId: item.itemId,
    requestedAmount: item.requestedAmount,
    userId: item.userId,
    // requestedDate defaults to now() in schema — no need to set it
  }));

  const sendPost = await prisma.request
    .createMany({ data })
    .catch((err) => {
      err.message = `[Sending request to table failed]: ${err.message}`;
      throw err;
    });

  if (sendPost.count === 0)
    return { success: false, message: "Nothing was posted to the request table" };

  return { success: true, message: "Posted to DB", count: sendPost.count };
};

/**
 * Save the text description that comes with a spoedaanvraag
 * Uses the separate reqDescirptions table (note: typo in schema is intentional)
 */
export const postRequestDescription = async (descriptionText) => {
  const result = await prisma.reqDescirptions
    .create({
      data: { descriptionField: descriptionText },
    })
    .catch((err) => {
      err.message = `[Saving request description failed]: ${err.message}`;
      throw err;
    });

  return { success: true, reqDescriptionId: result.reqDescriptionId };
};