import { REMAINING_AMOUNT, TAKE_LIMIT } from "#utils/magicNumberFile";
import { prisma } from "#utils/prismaClient";

//fetches the request batch id, and also checks if a request exist.
//Autoincrements to give you a batchId.
export const getCurrentOrNextReqBatchId = async (shouldIncrement = false) => {
  const result = await prisma.request
    .aggregate({
      _max: {
        requestBatchId: true,
      },
    })
    .catch((err) => {
      err.message = `[Getting batch info failed]: ${err.message}`;
      throw err;
    });

  // Falls back to 0 when no requests exist yet
  const currentBatchId = result._max.requestBatchId ?? 0;

  if (!shouldIncrement) {
    return {
      success: true,
      message: "BatchId given, not incremented",
      data: currentBatchId,
    };
  }

  return {
    success: true,
    message: "Incremented BatchId given",
    data: currentBatchId + 1,
  };
};

//! Things that get kritieke voorraad, for now the other fetchs won't be taking into account
export const fetchKritiekeVoorraad = async (userAuthLevel, departmentName) => {
  const kritiekeVoorraad = await prisma.items
    .findMany({
      where: {
        remainingAmount: {
          lte: REMAINING_AMOUNT,
        },
      },
      select: {
        itemId: true,
        itemName: true,
        remainingAmount: true,
        description: true,
        categories: { select: { categoryName: true } },
      },
      take: TAKE_LIMIT,
      orderBy: { itemName: "asc" },
    })
    .catch((err) => {
      err.message = `[Getting kritiekeVoorraad failed]: ${err.message}`;
      throw err;
    });

  if (!kritiekeVoorraad || kritiekeVoorraad.length === 0) {
    return {
      success: false,
      message: "There are no kritieke voorraad, or there are no items fetched",
      data: [],
    };
  }

  const kritikeVoorraadList = kritiekeVoorraad.map((item) => ({
    itemId: item.itemId,
    itemName: item.itemName,
    remainingAmount: item.remainingAmount,
    description: item.description,
    categoryName: item.categories?.categoryName ?? null,
  }));

  return {
    success: true,
    message: "Kritieke voorraad found",
    data: kritikeVoorraadList,
  };
};
