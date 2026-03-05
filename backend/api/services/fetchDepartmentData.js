import { prisma } from "#utils/prismaClient";

//Gets you the department id based on departmentName
export const fetchDepartmentId = async (departmentName) => {
  const departmentId = await prisma.department
    .findFirst({
      where: {
        departmentName: departmentName,
      },
      select: {
        departmentId: true,
      },
    })
    .catch((err) => {
      err.message = `[Failed getting department id from db]: ${err.message}`;
      throw err;
    });

  if (!departmentId)
    return { success: false, message: "Department doesn't exist in DB" };

  return { success: true, message: "DepartmentId send", data: departmentId };
};
