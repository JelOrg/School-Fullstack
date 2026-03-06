import { prisma } from "#utils/prismaClient";

//fetches the request batch id, and also checks if a request exist.
//Autoincrements to give you a batchId.
export const getCurrentOrNextReqBatchId = async (shouldIncrement = false) => {
  const batchId = await prisma.request
    .aggregate({
      _max: {
        requestBatchId: true,
      },
    })
    .catch((err) => {
      err.message = `[Getting batch info failed]: ${err.message}`;
      throw err;
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

export const fetchKritiekVoorraad = async (authLevel, departmentName) => {
  // Schema has no minimumAmount field on items — we use a hardcoded threshold of 10
  // TODO: add a minimumAmount field to the items table in schema.prisma when ready
  const CRITICAL_THRESHOLD = 10;

  const kritiekItems = await prisma.items
    .findMany({
      where: {
        remainingAmount: { lte: CRITICAL_THRESHOLD },
      },
      select: {
        itemId: true,
        itemName: true,
        remainingAmount: true,
        categories: { select: { categoryName: true } },
      },
    })
    .catch((err) => {
      err.message = `[fetchKritiekVoorraad failed]: ${err.message}`;
      throw err;
    });

  return {
    success: true,
    data: kritiekItems.map((i) => ({
      itemId: i.itemId,
      itemName: i.itemName,
      remainingAmount: i.remainingAmount,
      criticalThreshold: CRITICAL_THRESHOLD,
      categoryName: i.categories?.categoryName || "Onbekend",
    })),
  };
};

// Fetches the most recent pending requests as "meldingen"
// Schema: request has requestId, requestBatchId, itemId, requestedAmount, userId — no isUrgent/isResolved
// TODO: add isUrgent and isResolved boolean fields to the request table when ready
export const fetchMeldingenAlert = async (authLevel, departmentName) => {
  const alerts = await prisma.request
    .findMany({
      select: {
        requestId: true,
        requestBatchId: true,
        requestedAmount: true,
        requestedDate: true,
        items: { select: { itemName: true } },
        users: {
          select: {
            firstName: true,
            lastName: true,
            department: { select: { departmentName: true } },
          },
        },
      },
      orderBy: { requestedDate: "desc" },
      take: 20,
    })
    .catch((err) => {
      err.message = `[fetchMeldingenAlert failed]: ${err.message}`;
      throw err;
    });

  return {
    success: true,
    data: alerts.map((a) => ({
      requestId: a.requestId,
      requestBatchId: a.requestBatchId,
      itemName: a.items?.itemName || "Onbekend",
      requestedAmount: a.requestedAmount,
      department: a.users?.department?.departmentName || "Onbekend",
      requestedBy: `${a.users?.firstName || ""} ${a.users?.lastName || ""}`.trim(),
      requestedDate: a.requestedDate,
    })),
  };
};