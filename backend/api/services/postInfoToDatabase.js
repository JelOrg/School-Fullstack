import { prisma } from "#utils/prismaClient";

/**
 * Send spoedaanvraag to the DB
 */
export const postSpoedAanvraag = async (
  requesterId,
  requestBatchId,
  requestedItems,
  departmentId,
  textField,
  batchId,
) => {
  const sendAanvraag = await prisma.request.createMany({});
};
