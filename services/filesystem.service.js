"use strict";

const fs = require("fs-extra");
const path = require("path");

const ORGS_ROOT = path.resolve(__dirname, "..", "..", "..", "organizations");
const BACKEND_TEMPLATE = path.resolve(__dirname, "..", "..", "templates", "backend-template");
const FRONTEND_TEMPLATE = path.resolve(__dirname, "..", "..", "templates", "frontend-template");

/**
 * Resolve all relevant paths for an org slug.
 * Exported so other services can reference the same paths consistently.
 */
function orgPaths(slug) {
  const orgPath = path.join(ORGS_ROOT, slug);
  return {
    orgPath,
    backendDest: path.join(orgPath, "backend"),
    frontendDest: path.join(orgPath, "frontend"),
    assetsDir: path.join(orgPath, "assets", "logos"),
    configFile: path.join(orgPath, "organization.json"),
    nginxAvailable: `/etc/nginx/sites-available/${slug}`,
    nginxEnabled: `/etc/nginx/sites-enabled/${slug}`,
  };
}

/**
 * Assert the org directory does NOT already exist.
 * Prevents silent overwrites when two org names collide on the same slug.
 */
async function assertNoDuplicate(slug) {
  const { orgPath } = orgPaths(slug);
  const exists = await fs.pathExists(orgPath);
  if (exists) {
    throw new Error(`Organization slug "${slug}" already exists at ${orgPath}`);
  }
}

/**
 * Copy backend and frontend templates into the org directory.
 */
async function scaffoldDirectories(slug) {
  const { orgPath, backendDest, frontendDest } = orgPaths(slug);
  await fs.ensureDir(orgPath);
  await fs.copy(BACKEND_TEMPLATE, backendDest);
  await fs.copy(FRONTEND_TEMPLATE, frontendDest);
  return { orgPath, backendDest, frontendDest };
}

/**
 * If a logo file was uploaded, copy it to the org's assets directory.
 * Returns the public logo path or null.
 */
async function handleLogo(slug, file) {
  if (!file) return null;
  const { assetsDir } = orgPaths(slug);
  await fs.ensureDir(assetsDir);
  const dest = path.join(assetsDir, file.filename);
  await fs.copy(file.path, dest);
  return `/assets/logos/${file.filename}`;
}

/**
 * Write organization.json with all metadata from the saved model.
 */
async function writeOrgConfig(slug, { name, email, category, portNumber, orgDomain, logoPath, gst, address, noOfUsers }) {
  const { configFile } = orgPaths(slug);
  await fs.writeJson(
    configFile,
    {
      organizationName: name,
      email,
      category,
      portNumber,
      domain: orgDomain,
      logo: logoPath,
      ...(gst && { gst }),
      ...(address && { address }),
      ...(noOfUsers && { noOfUsers }),
      createdAt: new Date().toISOString(),
    },
    { spaces: 2 }
  );
}

/**
 * Write the backend .env file.
 * jwtSecret is caller-generated (cryptographically random).
 * dbUri is the resolved URI including org slug as DB name.
 */
async function writeBackendEnv(slug, { email, orgDomain, jwtSecret, dbUri, backendDest }) {
  const envContent = [
    `PORT=5000`,
    `ORG_NAME=${slug}`,
    `ORG_EMAIL=${email}`,
    `JWT_SECRET=${jwtSecret}`,
    `JWT_EXPIRES_TIME=7d`,
    `NEW_DB_LOCAL_URI=${dbUri}`,
  ].join("\n");

  await fs.writeFile(path.join(backendDest, ".env"), envContent, { mode: 0o600 });
}

/**
 * Write frontend config.json.
 */
async function writeFrontendConfig(slug, { name, orgDomain, logoPath, frontendDest }) {
  await fs.writeJson(
    path.join(frontendDest, "config.json"),
    {
      API_URL: `https://${orgDomain}/api/v1`,
      ORG_NAME: name,
      LOGO: logoPath,
    },
    { spaces: 2 }
  );
}

/**
 * Write the nginx virtual-host config file.
 * Only the slug-derived domain and port (already validated integers) are
 * interpolated here — no raw user strings.
 */
async function writeNginxConfig(slug, { orgDomain, portNumber }) {
  const { nginxAvailable } = orgPaths(slug);
  const config = `server {
    listen 80;
    server_name ${orgDomain};

    location / {
        proxy_pass http://localhost:${portNumber};
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
`;
  await fs.writeFile(nginxAvailable, config, { mode: 0o644 });
  return nginxAvailable;
}

/**
 * Remove everything created so far — used in the rollback path.
 */
async function cleanupOrgFiles(slug) {
  const { orgPath, nginxAvailable, nginxEnabled } = orgPaths(slug);
  await fs.remove(orgPath).catch(() => {});
  await fs.remove(nginxAvailable).catch(() => {});
  await fs.remove(nginxEnabled).catch(() => {});
}

module.exports = {
  orgPaths,
  assertNoDuplicate,
  scaffoldDirectories,
  handleLogo,
  writeOrgConfig,
  writeBackendEnv,
  writeFrontendConfig,
  writeNginxConfig,
  cleanupOrgFiles,
};
