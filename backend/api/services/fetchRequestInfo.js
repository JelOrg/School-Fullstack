import { prisma } from "#utils/prismaClient";

//builds a where-filter based on auth level and department
const buildDepartmentScopeFilter = (userAuthLevel, userDepartmentName) => {
  //manager/admin can view all departments
  if (userAuthLevel >= 2) return {};

  //employee should only view own department requests
  return {
    users: {
      department: {
        departmentName: userDepartmentName,
      },
    },
  };
};

//fetches latest request history data (default top 10)
export const fetchRecentRequestsHistory = async ({
  userAuthLevel,
  userDepartmentName,
  limit = 10,
}) => {
  const whereFilter = buildDepartmentScopeFilter(
    userAuthLevel,
    userDepartmentName,
  );

  const recentRequests = await prisma.request
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
    requestId: request.requestId,
    requestBatchId: request.requestBatchId,
    requestedAmount: request.requestedAmount,
    requestedDate: request.requestedDate,
    itemId: request.items?.itemId,
    itemName: request.items?.itemName,
    remainingAmount: request.items?.remainingAmount,
    requestedByUserId: request.users?.userId,
    requestedByName: `${request.users?.firstName || ""} ${request.users?.lastName || ""}`.trim(),
    roleName: request.users?.role?.roleName,
    departmentName: request.users?.department?.departmentName,
  }));

  return {
    success: true,
    message: "Recent request history fetched",
    data: mappedHistory,
  };
};

//fetches statistics overview data for the statistics page
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
