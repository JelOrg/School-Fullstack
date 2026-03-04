import { prisma } from "#utils/prismaClient";

//fetches the request batch id, and also checks if a request exist.
//Autoincrements to give you a batchId.
export const getCurrentOrNextReqBatchId = async (shouldIncrement = false) => {
  const batchId = await prisma.request.aggregate({
    _max: {
      requestBatchId: true,
    },
  });

  //! might mess up if there is an exception or error
  const currenctBatchId = batchId._max.requestBatchId ?? 0;

  if (!shouldIncrement)
    return {
      succes: true,
      message: "BatchId given, not incremented",
      data: currenctBatchId,
    };

  return {
    succes: true,
    message: "Incremented BatchId given",
    data: currenctBatchId + 1,
  };
};
