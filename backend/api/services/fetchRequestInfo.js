import { TAKE_LIMIT, TAKE_LIMIT_URGENT_REQUEST } from "#utils/magicNumberFile";
import { prisma } from "#utils/prismaClient";

//fetches latest request history data (default top 10)
export const fetchRecentRequestsHistory = async ({
  //TODO Can add a per dep or user auth filter, maybe later
  userAuthLevel,
  userDepartmentName,
  limit = 10,
}) => {
  const recentRequests = await prisma.request
    .findMany({
      orderBy: {
        requestedDate: "desc",
      },
      take: limit,
      select: {
        requestBatchId: true,
        requestedAmount: true,
        requestedDate: true,
        items: {
          select: {
            itemName: true,
          },
        },
        users: {
          select: {
            firstName: true,
            lastName: true,
            department: {
              select: {
                departmentName: true,
              },
            },
            role: {
              select: {
                roleName: true,
              },
            },
          },
        },
      },
    })
    .catch((err) => {
      err.message = `[Failed fetching request history]: ${err.message}`;
      throw err;
    });

  const mappedHistory = recentRequests.map((request) => ({
    itemName: request.items?.itemName,
    requestBatchId: request.requestBatchId,
    requestedAmount: request.requestedAmount,
    requestedDate: request.requestedDate,
    firstName: request.users.firstName,
    lastName: request.users.lastName,
    roleName: request.users?.role?.roleName,
    departmentName: request.users?.department?.departmentName,
  }));

  return {
    success: true,
    message: "Recent request history fetched",
    data: mappedHistory,
  };
};
//!====

//fetches statistics overview data for the statistics page
//TODO we can increase or remove limits, since we need to get a lot of data for the statistics
export const fetchRequestStatistics = async ({
  userAuthLevel,
  userDepartmentName,
  topLimit = 10,
}) => {
  const whereFilter = buildDepartmentScopeFilter(
    userAuthLevel,
    userDepartmentName,
  );

  const allScopedRequests = await prisma.request
    .findMany({
      where: whereFilter,
      orderBy: {
        requestedDate: "desc",
      },
      select: {
        requestId: true,
        requestedAmount: true,
        requestedDate: true,
        items: {
          select: {
            itemId: true,
            itemName: true,
          },
        },
      },
    })
    .catch((err) => {
      err.message = `[Failed fetching request statistics]: ${err.message}`;
      throw err;
    });

  const totalRequests = allScopedRequests.length;
  const totalRequestedAmount = allScopedRequests.reduce(
    (sum, row) => sum + Number(row.requestedAmount || 0),
    0,
  );

  //!Check
  const itemAggregationMap = new Map();
  for (const row of allScopedRequests) {
    const key = row.items?.itemId ?? -1;
    const existingItem = itemAggregationMap.get(key) || {
      itemId: row.items?.itemId,
      itemName: row.items?.itemName || "Unknown item",
      totalRequestedAmount: 0,
      requestCount: 0,
    };

    existingItem.totalRequestedAmount += Number(row.requestedAmount || 0);
    existingItem.requestCount += 1;
    itemAggregationMap.set(key, existingItem);
  }

  const topRequestedItems = Array.from(itemAggregationMap.values())
    .sort((a, b) => b.totalRequestedAmount - a.totalRequestedAmount)
    .slice(0, topLimit);

  return {
    success: true,
    message: "Request statistics fetched",
    data: {
      totalRequests: totalRequests,
      totalRequestedAmount: totalRequestedAmount,
      uniqueItemsRequested: itemAggregationMap.size,
      topRequestedItems: topRequestedItems,
    },
  };
};
//!====

//! For fecthing All urgent request
export const fetchUrgentRequest = async (userAuthLevel, departmentName) => {
  const urgentRequest = await prisma.request
    .findMany({
      where: {
        isUrgent: true,
        isCompleted: false,
      },
      select: {
        requestBatchId: true,
        requestedAmount: true,
        requestedDate: true,

        items: { select: { itemName: true } },
        users: { select: { lastName: true, firstName: true } },
        department: { select: { departmentName: true } },
      },
      take: TAKE_LIMIT_URGENT_REQUEST,
      orderBy: { requestedDate: "desc" },
    })
    .catch((error) => {
      console.error("Failed to fetch urgent requests:", error);
      return null;
    });

  if (!urgentRequest || urgentRequest.length === 0) {
    return { success: false, message: "No urgent requests found.", data: [] };
  }

  const flattendItems = urgentRequest.map((request) => ({
    requestBatchId: request.requestBatchId,
    requestedAmount: request.requestedAmount,
    requestedDate: request.requestedDate,
    item: request.items.itemName,
    userFirstName: request.users.firstName,
    userLastName: request.users.lastName,
    departmentName: request.department.departmentName,
  }));

  return {
    success: true,
    message: "Fetched urgent request",
    data: flattendItems,
  };
};

//fetches the aanvragen (requests) for a specific user, or all if admin/manager
export const fetchUserAanvragen = async ({
  userAuthLevel,
  userDepartmentName,
  userId,
  limit = 20,
}) => {
  //Build the filter: employees see only their own requests, managers/admins see all (or department-scoped)
  const whereFilter =
    userAuthLevel >= 2
      ? buildDepartmentScopeFilter(userAuthLevel, userDepartmentName)
      : { userId: userId };

  const aanvragen = await prisma.request
    .findMany({
      where: whereFilter,
      orderBy: {
        requestedDate: "desc",
      },
      take: limit,
      select: {
        requestId: true,
        requestBatchId: true,
        requestedAmount: true,
        isUrgent: true,
        requestedDate: true,
        items: {
          select: {
            itemId: true,
            itemName: true,
            remainingAmount: true,
          },
        },
        users: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                departmentName: true,
              },
            },
          },
        },
      },
    })
    .catch((err) => {
      err.message = `[Failed fetching user aanvragen]: ${err.message}`;
      throw err;
    });

  const mappedAanvragen = aanvragen.map((request) => ({
    requestId: request.requestId,
    requestBatchId: request.requestBatchId,
    requestedAmount: request.requestedAmount,
    isUrgent: request.isUrgent,
    requestedDate: request.requestedDate,
    itemId: request.items?.itemId,
    itemName: request.items?.itemName,
    remainingAmount: request.items?.remainingAmount,
    requestedByUserId: request.users?.userId,
    requestedByName:
      `${request.users?.firstName || ""} ${request.users?.lastName || ""}`.trim(),
    departmentName: request.users?.department?.departmentName,
  }));

  return {
    success: true,
    message: "User aanvragen fetched",
    data: mappedAanvragen,
  };
};
