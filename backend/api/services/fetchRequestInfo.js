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
  const fetchItemUsage = await prisma.request
    .findMany({
      orderBy: {
        requestedDate: "desc",
      },
      take: topLimit,
      select: {
        requestId: true,
        requestedAmount: true,
        requestedDate: true,
        items: {
          select: {
            itemName: true,
            remainingAmount: true,
          },
        },
      },
    })
    .catch((err) => {
      err.message = `[Failed fetching request statistics]: ${err.message}`;
      throw err;
    });

  if (!fetchItemUsage)
    return { success: false, message: "Couldn't find any item usages" };

  //TODO do math and see how much a a certain item is being used.
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
