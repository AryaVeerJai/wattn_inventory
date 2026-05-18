"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { userSchema } = require("../models/user.schema");

const BCRYPT_ROUNDS = 12; // Slightly stronger than 10; still fast enough

/**
 * Create a new Mongoose connection to the org-specific database,
 * create the first admin user with a securely generated password,
 * then cleanly close the connection.
 *
 * @param {string} dbUri    - Full MongoDB URI for this org's database
 * @param {object} params
 * @param {string} params.name         - Organization display name
 * @param {string} params.email        - Admin email address
 * @param {string} params.tempPassword - Caller-generated random password
 * @returns {{ userId: string }} - The created user's ID (for audit logging)
 */
async function createFirstOrgUser(dbUri, { name, email, tempPassword }) {
  let orgConnection;

  try {
    orgConnection = mongoose.createConnection(dbUri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
    });

    // Wait for the connection to be ready before operating on it
    await orgConnection.asPromise();

    const User = orgConnection.model("User", userSchema);

    const hashedPassword = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    const user = await User.create({
      name: `${name} Admin`,
      email,
      password: hashedPassword,
      role: "OWNER",
      isVerified: true,
      mustChangePassword: true, // Flag so UI forces a password change on first login
    });

    return { userId: user._id.toString() };
  } finally {
    // Always close the connection — even if an error was thrown above
    if (orgConnection) {
      await orgConnection.close().catch(() => {});
    }
  }
}

module.exports = { createFirstOrgUser };
