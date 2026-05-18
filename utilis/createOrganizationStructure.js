"use strict";

const { validateOrgInput } = require("./validate");
const { generateTempPassword, generateJwtSecret } = require("./credentials");

const fsSvc = require("../services/filesystem.service");
const dbSvc = require("../services/database.service");
const dockerSvc = require("../services/docker.service");
const nginxSvc = require("../services/nginx.service");

/**
 * createOrganizationStructure
 *
 * Called by the controller with the already-saved Mongoose document and the
 * optional Multer file upload:
 *
 *   await createOrganizationStructure(newDynamicDoc, req.file);
 *
 * Flow:
 *   1. Validate all inputs (throws on bad data — nothing else runs)
 *   2. Scaffold file system (backend + frontend templates)
 *   3. Handle logo upload
 *   4. Write org config, backend .env, frontend config
 *   5. Create first admin user in org-specific DB
 *   6. Start Docker container
 *   7. Enable nginx virtual host
 *
 * On any failure after step 2, a best-effort rollback tears down everything
 * created so far, so no half-provisioned orgs are left behind.
 *
 * Returns: { slug, orgDomain, tempPassword, userId }
 *
 * IMPORTANT — tempPassword must be emailed to the admin and never logged.
 */
async function createOrganizationStructure(orgDoc, file = null) {
  // ─── Guard ───────────────────────────────────────────────────────────────────
  if (!process.env.CREATER_ORGANIZATION_URI) {
    throw new Error("Environment variable CREATER_ORGANIZATION_URI is not set");
  }

  // ─── 1. Validate ────────────────────────────────────────────────────────────
  // validateOrgInput handles both Mongoose documents and plain objects.
  // Slug is derived from name + last-6 chars of _id to guarantee uniqueness.
  const { name, email, category, portNumber, slug, gst, address, noOfUsers } =
    validateOrgInput(orgDoc);

  const orgDomain = `${slug}.protobiz.ai`;
  const dbUri = `${process.env.CREATER_ORGANIZATION_URI}/${slug}`;

  // Track what has been created so rollback knows what to undo
  let filesCreated = false;
  let containerCreated = false;
  let nginxCreated = false;

  try {
    // ─── 2. File system scaffold ───────────────────────────────────────────────
    const { backendDest, frontendDest } = await fsSvc.scaffoldDirectories(slug);
    filesCreated = true;

    // ─── 3. Logo ───────────────────────────────────────────────────────────────
    const logoPath = await fsSvc.handleLogo(slug, file);

    // ─── 4. Config files ───────────────────────────────────────────────────────
    const jwtSecret = generateJwtSecret();

    await Promise.all([
      fsSvc.writeOrgConfig(slug, {
        name, email, category, portNumber, orgDomain, logoPath,
        gst, address, noOfUsers,
      }),
      fsSvc.writeBackendEnv(slug, { email, orgDomain, jwtSecret, dbUri, backendDest }),
      fsSvc.writeFrontendConfig(slug, { name, orgDomain, logoPath, frontendDest }),
    ]);

    // ─── 5. First admin user ───────────────────────────────────────────────────
    const tempPassword = generateTempPassword();
    const { userId } = await dbSvc.createFirstOrgUser(dbUri, { name, email, tempPassword });

    // ─── 6. Docker container ───────────────────────────────────────────────────
    const containerName = await dockerSvc.startOrgContainer(slug, { portNumber });
    containerCreated = true;

    // ─── 7. Nginx virtual host ─────────────────────────────────────────────────
    await nginxSvc.enableOrgVirtualHost(slug, { orgDomain, portNumber });
    nginxCreated = true;

    console.log(
      `[org-setup] ✔ "${name}" provisioned — domain: ${orgDomain}, container: ${containerName}`
    );

    return { slug, orgDomain, userId, tempPassword };
  } catch (err) {
    console.error(`[org-setup] ✖ Provisioning failed for "${slug}": ${err.message}`);
    await rollback(slug, { filesCreated, containerCreated, nginxCreated });
    throw err;
  }
}

/**
 * deleteOrganizationStructure
 *
 * Called by the controller for each org being deleted:
 *
 *   await deleteOrganizationStructure(org);
 *
 * Tears down in safe order:
 *   1. Nginx virtual host (stop routing traffic first)
 *   2. Docker container   (stop compute)
 *   3. File system        (remove templates, configs, assets)
 *
 * Each step is independent — one failure does not prevent the others.
 * All errors are logged so ops can clean up any leftovers manually.
 *
 * The controller deletes the MongoDB record separately after this returns.
 */
async function deleteOrganizationStructure(orgDoc) {
  // Accept either a Mongoose document or a plain object
  const doc = typeof orgDoc.toObject === "function" ? orgDoc.toObject() : { ...orgDoc };
  const { name } = doc;

  // Re-derive the slug the same way createOrganizationStructure did.
  // We use the _id suffix so the slug always matches what was created.
  const { validateOrgInput } = require("./utils/validate");
  let slug;
  try {
    ({ slug } = validateOrgInput(orgDoc));
  } catch {
    // If validation fails (e.g. malformed doc), derive a best-effort slug
    slug = String(name || "unknown")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const idSuffix = doc._id ? String(doc._id).slice(-6) : "";
    if (idSuffix) slug = `${slug}-${idSuffix}`;
  }

  console.log(`[org-delete] Starting teardown for slug "${slug}"…`);

  // 1. Nginx — disable routing first so no new traffic hits a dead container
  await nginxSvc
    .disableOrgVirtualHost(slug)
    .then(() => console.log(`[org-delete] ✔ Nginx disabled for "${slug}"`))
    .catch((e) => console.error(`[org-delete] ✖ Nginx disable failed for "${slug}": ${e.message}`));

  // 2. Docker — stop and remove the container
  await dockerSvc
    .removeOrgContainer(slug)
    .then(() => console.log(`[org-delete] ✔ Container removed for "${slug}"`))
    .catch((e) => console.error(`[org-delete] ✖ Container removal failed for "${slug}": ${e.message}`));

  // 3. File system — remove the entire org directory + nginx config
  await fsSvc
    .cleanupOrgFiles(slug)
    .then(() => console.log(`[org-delete] ✔ Files cleaned for "${slug}"`))
    .catch((e) => console.error(`[org-delete] ✖ File cleanup failed for "${slug}": ${e.message}`));

  console.log(`[org-delete] Teardown complete for slug "${slug}"`);
}

/**
 * Best-effort rollback after a failed createOrganizationStructure.
 * Each step is independent so one failure does not prevent the next.
 */
async function rollback(slug, { filesCreated, containerCreated, nginxCreated }) {
  console.warn(`[org-setup] Rolling back slug "${slug}"…`);

  if (nginxCreated) {
    await nginxSvc.disableOrgVirtualHost(slug).catch((e) =>
      console.error(`[org-setup] Rollback: nginx disable failed — ${e.message}`)
    );
  }

  if (containerCreated) {
    await dockerSvc.removeOrgContainer(slug).catch((e) =>
      console.error(`[org-setup] Rollback: docker remove failed — ${e.message}`)
    );
  }

  if (filesCreated) {
    await fsSvc.cleanupOrgFiles(slug).catch((e) =>
      console.error(`[org-setup] Rollback: file cleanup failed — ${e.message}`)
    );
  }

  console.warn(`[org-setup] Rollback complete for slug "${slug}"`);
}

module.exports = { createOrganizationStructure, deleteOrganizationStructure };
