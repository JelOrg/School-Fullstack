//! THIS FILE HOLDS ARE MAGIC NUMBERs

//! for tokenHandler service
export const ONE_HOUR = 3600000; // 1 * 60 * 60 * 1000

//! This would be better to keep in the db, because there could be a lot more roles
//! FOR authorization middleware
export const ROLE_AUTH_LEVEL = {
  employee: 1,
  manager: 2,
  admin: 3,
};
