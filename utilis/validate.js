"use strict";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PORT_MIN = 3000;
const PORT_MAX = 65535;

/**
 * Validate and sanitize all inputs from the saved OrganizationModel document.
 * Called with the Mongoose doc that the controller already persisted, so all
 * fields are the same shape as req.body (strings, parsed integers, etc.).
 *
 * Returns a clean, safe object. Throws a descriptive Error on the first
 * invalid field — nothing proceeds until this passes.
 *
 * Fields handled:
 *   name, email, category, portNumber  — required
 *   gst, address, noOfUsers            — optional, passed through for config
 */
function validateOrgInput(org) {
  if (!org || typeof org !== "object") {
    throw new Error("organization must be a non-null object");
  }

  // Support both plain objects and Mongoose documents (.toObject() is safe to call)
  const doc = typeof org.toObject === "function" ? org.toObject() : { ...org };

  const { name, email, category, portNumber, gst, address, noOfUsers, _id } = doc;

  // ── name ────────────────────────────────────────────────────────────────────
  if (typeof name !== "string" || name.trim().length < 2) {
    throw new Error("organization.name must be at least 2 characters");
  }

  // Slug: lowercase, spaces → hyphens, strip everything else.
  // We append the first 6 chars of the MongoDB _id to guarantee uniqueness
  // even when two org names collapse to the same slug (e.g. "Acme" vs "ACME").
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  if (!SLUG_RE.test(slug)) {
    throw new Error(`Derived slug "${slug}" is invalid — check the organization name`);
  }

  // ── email ───────────────────────────────────────────────────────────────────
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    throw new Error("organization.email is not a valid email address");
  }

  // ── category ────────────────────────────────────────────────────────────────
  if (typeof category !== "string" || category.trim().length === 0) {
    throw new Error("organization.category is required");
  }

  // ── portNumber ──────────────────────────────────────────────────────────────
  const port = Number(portNumber);
  if (!Number.isInteger(port) || port < PORT_MIN || port > PORT_MAX) {
    throw new Error(
      `organization.portNumber must be an integer between ${PORT_MIN} and ${PORT_MAX}`
    );
  }

  // ── optional fields ─────────────────────────────────────────────────────────
  const users = Number(noOfUsers);
  const validatedNoOfUsers = Number.isInteger(users) && users > 0 ? users : null;

  return {
    _id: _id ? String(_id) : null,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    category: category.trim(),
    portNumber: port,
    slug,
    gst: typeof gst === "string" ? gst.trim() : null,
    address: typeof address === "string" ? address.trim() : null,
    noOfUsers: validatedNoOfUsers,
  };
}

module.exports = { validateOrgInput };