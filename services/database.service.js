"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 12;

// user.schema.js does: module.exports = userSchema  (the Schema object directly)
const userSchema = require("../../models/user.schema");

/**
 * Open a dedicated Mongoose connection to the org's Atlas database,
 * create the first admin user, then close the connection.
 *
 * Uses createConnection() — not the global mongoose instance — so this
 * runs entirely against the org's own database without touching the main DB.
 *
 * Key: orgConnection.model() must be used (not mongoose.model()) when
 * registering schemas on a specific connection.
 */
async function createFirstOrgUser(dbUri, { name, email, tempPassword }) {
  let orgConnection;

  try {
    orgConnection = mongoose.createConnection(dbUri, {
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS:         15_000,
    });

    await orgConnection.asPromise();

    // Register schema on THIS connection — not on the global mongoose
    const User = orgConnection.model("User", userSchema);

    // user.schema.js has a pre("save") bcrypt hook, so pass the plain password
    // and let the hook hash it — same as the rest of your app does
    const user = await User.create({
      name:       `${name} Admin`,
      email,
      password:   tempPassword,   // hashed by pre("save") hook in user.schema.js
      role:       "OWNER",
      isVerified: true,
    });

    console.log(`[org-setup] ✔ Admin user created (id: ${user._id})`);
    return { userId: user._id.toString() };

  } finally {
    if (orgConnection) {
      await orgConnection.close().catch(() => {});
    }
  }
}

module.exports = { createFirstOrgUser };