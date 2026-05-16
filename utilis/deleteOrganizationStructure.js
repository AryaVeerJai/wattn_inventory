const mongoose = require("mongoose");
const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const deleteOrganizationStructure = async (organization) => {
  const orgSlug = organization.name.toLowerCase().replace(/\s+/g, "-");
  const containerName = `${orgSlug}-backend`;

  const orgPath = path.join(
    __dirname,
    "..",
    "..",
    "organizations",
    orgSlug
  );

  const domain = `${orgSlug}.protobiz.ai`;

  // 1. Docker cleanup
  exec(
    `docker stop ${containerName} || true && docker rm ${containerName} || true`
  );

  // 2. Drop DB
  try {
    const conn = mongoose.connection.useDb(orgSlug, { useCache: true });
    await conn.dropDatabase();
  } catch (e) {
    console.log("DB delete error:", e.message);
  }

  // 3. Remove folder
  await fs.remove(orgPath);

  // 4. Remove nginx
  exec(
    `sudo rm -f /etc/nginx/sites-available/${domain} &&
     sudo rm -f /etc/nginx/sites-enabled/${domain} &&
     sudo systemctl reload nginx`
  );
};

module.exports = deleteOrganizationStructure;