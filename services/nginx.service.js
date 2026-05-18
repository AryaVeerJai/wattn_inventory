"use strict";

const { createNginxSymlink, reloadNginx } = require("../utilis/shell");
const { writeNginxConfig, orgPaths } = require("./filesystem.service");

/**
 * Write the nginx virtual-host config, create the sites-enabled symlink,
 * test the config, and reload nginx — all as awaitable steps.
 *
 * Errors propagate to the caller so the orchestrator can roll back.
 */
async function enableOrgVirtualHost(slug, { orgDomain, portNumber }) {
  // 1. Write /etc/nginx/sites-available/<slug>
  const availablePath = await writeNginxConfig(slug, { orgDomain, portNumber });

  // 2. Symlink into sites-enabled (ln -sf src dest via execFile — no shell)
  const { nginxEnabled } = orgPaths(slug);
  await createNginxSymlink(availablePath, nginxEnabled);

  // 3. Test nginx config then reload
  await reloadNginx();
}

/**
 * Remove the sites-enabled symlink and reload nginx.
 * Used during rollback — does not touch sites-available (cleanupOrgFiles handles that).
 */
async function disableOrgVirtualHost(slug) {
  const fs = require("fs-extra");
  const { nginxEnabled } = orgPaths(slug);
  await fs.remove(nginxEnabled).catch(() => {});
  await reloadNginx().catch(() => {});
}

module.exports = { enableOrgVirtualHost, disableOrgVirtualHost };
