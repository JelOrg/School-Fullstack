import crypto from "crypto";

// Generates a random hex string (0-9, a-f)
export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Generates a random Base64 string (A-Z, a-z, 0-9, +, /)
export function generateSecureBase64() {
  return crypto.randomBytes(32).toString("base64");
}
