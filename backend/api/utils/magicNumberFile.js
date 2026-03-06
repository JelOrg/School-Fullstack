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

//! For dashboardContoller
export const REFRESH_RATES = {
  CRITICAL_VITALS: 2000, // 2 seconds for ICU
  STANDARD_DASHBOARD: 5000, // 5 seconds for general ward
  SYSTEM_STATUS: 60000, // 1 minute for battery/wifi status
};

export const DB_LIMITS = {
  MAX_POOL_SIZE: 10,
  QUERY_TIMEOUT: 15000,
};

/**
 * Standard HTTP Status Codes
 * Categorized for easy reference in Controllers
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors (User's fault)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401, // Not logged in
  FORBIDDEN: 403, // Logged in, but wrong Access Level
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,

  // Server Errors (Our fault)
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

//Used for SSE
export const VERIFY_INTERVAL = 5 * 60 * 1000; // 5 Minutes
