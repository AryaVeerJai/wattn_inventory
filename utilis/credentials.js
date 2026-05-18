"use strict";

const crypto = require("crypto");

/**
 * Generate a cryptographically random password.
 * 24 URL-safe base64 characters — strong enough for a temporary credential
 * that the admin must change on first login.
 */
function generateTempPassword() {
  return crypto.randomBytes(18).toString("base64url"); // ~24 chars, URL-safe
}

/**
 * Generate a cryptographically random JWT secret.
 * 48 random bytes → 64 hex chars. Completely independent of org name.
 */
function generateJwtSecret() {
  return crypto.randomBytes(48).toString("hex");
}

module.exports = { generateTempPassword, generateJwtSecret };
