//role-to-level map used for authorization checks
import { HTTP_STATUS, ROLE_AUTH_LEVEL } from "#utils/magicNumberFile";

// Maps actual DB role names → numeric auth level
// Extend this if you add more roles to the DB
const ROLE_NAME_TO_LEVEL = {
  // REQUESTER roles (nurses, doctors, etc.)
  verpleegkundige: ROLE_AUTH_LEVEL.employee,
  arts: ROLE_AUTH_LEVEL.employee,
  spoedarts: ROLE_AUTH_LEVEL.employee,
  specialist: ROLE_AUTH_LEVEL.employee,

  // MANAGER roles
  "logistieke afdeling": ROLE_AUTH_LEVEL.manager,
  "interne apotheek": ROLE_AUTH_LEVEL.manager,
  ziekenhuismanagement: ROLE_AUTH_LEVEL.manager,
  inkoopafdeling: ROLE_AUTH_LEVEL.manager,
  magazijn: ROLE_AUTH_LEVEL.manager,

  // ADMIN roles
  directie: ROLE_AUTH_LEVEL.admin,
};

export const getUserAuthorizationLevel = (required) => (req, res, next) => {
  const roleName = req.tokenInformation?.userRoleName?.toLowerCase();

  // Map the DB role name to a numeric level
  const userLevel = ROLE_NAME_TO_LEVEL[roleName];

  // 1. If role is unrecognized, bounce to login
  if (userLevel === undefined) return res.redirect("/login");

  //Saves the auth level
  req.userAuthLevel = userLevel;

  // 2. If level is too low, bounce to dashboard (with loop protection)
  if (userLevel < required) {
    if (req.path === "/dashboard")
      return res.status(HTTP_STATUS.FORBIDDEN).send("Forbidden");
    return res.redirect("/dashboard?error=denied");
  }

  next();
};

//checks if user's department is allowed for an endpoint
// export const authorizeByDepartment = (allowedDepartments = []) => {
//   return (req, res, next) => {
//     const userDepartment = normalizeValue(req.user?.userDepartmentName);
//     if (!userDepartment) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden: department information is missing",
//       });
//     }

//     //if no specific departments are given, only the existence is validated
//     if (!allowedDepartments.length) return next();

//     const normalizedAllowedDepartments = allowedDepartments.map((department) =>
//       normalizeValue(department),
//     );

//     if (!normalizedAllowedDepartments.includes(userDepartment)) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden: department is not allowed for this endpoint",
//       });
//     }

//     next();
//   };
// };

//combined authorization check for role-level and department
// export const authorizeByLevelAndDepartment = (
//   minimumLevel,
//   allowedDepartments = [],
// ) => {
//   return (req, res, next) => {
//     const roleName = normalizeValue(req.user?.userRoleName);
//     const userDepartment = normalizeValue(req.user?.userDepartmentName);
//     const userLevel = ROLE_AUTH_LEVEL[roleName] || 0;

//     if (!roleName || !userDepartment) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden: role or department information is missing",
//       });
//     }

//     if (userLevel < minimumLevel) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden: insufficient authorization level",
//       });
//     }

//     if (!allowedDepartments.length) return next();

//     const normalizedAllowedDepartments = allowedDepartments.map((department) =>
//       normalizeValue(department),
//     );

//     if (!normalizedAllowedDepartments.includes(userDepartment)) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden: department is not allowed for this endpoint",
//       });
//     }

//     next();
//   };
// };