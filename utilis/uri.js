"use strict";

/**
 * Build a per-org MongoDB URI from the Atlas connection string template.
 *
 * Atlas URIs look like:
 *   mongodb://user:pass@host1,host2,host3/defaultDb?ssl=true&replicaSet=...
 *
 * We replace whatever database name sits between the last "/" and the "?"
 * (or end-of-string) with the org slug, leaving the rest of the URI intact.
 *
 * The env var must contain a full Atlas connection string with any placeholder
 * database name — we replace it unconditionally.
 *
 * Example .env value:
 *   CREATER_ORGANIZATION_URI=mongodb://myuser:mypass@ac-guz6op5-shard-00-00.dbdpx9i.mongodb.net:27017,ac-guz6op5-shard-00-01.dbdpx9i.mongodb.net:27017,ac-guz6op5-shard-00-02.dbdpx9i.mongodb.net:27017/template?ssl=true&replicaSet=atlas-89v3w5-shard-0&authSource=admin&appName=wattninventryadmin
 *
 * Result for slug "acme-a1b2c3":
 *   mongodb://myuser:mypass@ac-guz6op5-shard-00-00.dbdpx9i.mongodb.net:27017,...27017/acme-a1b2c3?ssl=true&replicaSet=atlas-89v3w5-shard-0&authSource=admin&appName=wattninventryadmin
 *
 * Throws if the env var is missing or the URI cannot be parsed.
 */
function buildOrgDbUri(slug) {
  const template = process.env.CREATER_ORGANIZATION_URI;

  if (!template || !template.trim()) {
    throw new Error("Environment variable CREATER_ORGANIZATION_URI is not set");
  }

  // Find the last "/" — everything after it up to "?" (or end-of-string) is
  // the database name in the connection string.
  const slashIdx = template.lastIndexOf("/");
  if (slashIdx === -1) {
    throw new Error(
      "CREATER_ORGANIZATION_URI does not contain a '/' — it must be a full MongoDB connection string"
    );
  }

  const before = template.slice(0, slashIdx + 1); // "mongodb://user:pass@host1,.../  "
  const after = template.slice(slashIdx + 1);      // "templateDb?ssl=true&replicaSet=..."

  // Preserve the query string (everything from "?" onwards)
  const queryStart = after.indexOf("?");
  const queryString = queryStart !== -1 ? after.slice(queryStart) : "";

  return `${before}${slug}${queryString}`;
}

module.exports = { buildOrgDbUri };