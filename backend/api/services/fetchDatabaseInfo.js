import { prisma } from "#utils/prismaClient";

//fetches the request batch id, and also checks if a request exist.
//Autoincrements to give you a batchId.
export const fetchRequestBatchId = async () => {
  const batchId = await prisma.request.findFirst({
    where: {},
  });
};
