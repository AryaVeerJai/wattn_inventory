const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const createOrganizationStructure = async (organization, file) => {
  try {
    const orgSlug = organization.name
      .toLowerCase()
      .replace(/\s+/g, "-");

    const orgDomain = `${orgSlug}.protobiz.ai`;

    const orgPath = path.join(
      __dirname,
      "..",
      "..",
      "organizations",
      orgSlug
    );

    const backendTemplate = path.join(
      __dirname,
      "..",
      "templates",
      "backend-template"
    );

    const frontendTemplate = path.join(
      __dirname,
      "..",
      "templates",
      "frontend-template"
    );

    const backendDestination = path.join(orgPath, "backend");
    const frontendDestination = path.join(orgPath, "frontend");

    // =========================
    // 1. CREATE FOLDERS
    // =========================
    await fs.ensureDir(orgPath);
    await fs.copy(backendTemplate, backendDestination);
    await fs.copy(frontendTemplate, frontendDestination);

    // =========================
    // 2. LOGO HANDLING
    // =========================
    let logoPath = null;

    if (file) {
      const logoDir = path.join(orgPath, "assets", "logos");
      await fs.ensureDir(logoDir);

      logoPath = `/assets/logos/${file.filename}`;

      await fs.copy(file.path, path.join(logoDir, file.filename));
    }

    // =========================
    // 3. CONFIG FILE
    // =========================
    await fs.writeJson(
      path.join(orgPath, "organization.json"),
      {
        organizationName: organization.name,
        email: organization.email,
        category: organization.category,
        portNumber: organization.portNumber,
        domain: orgDomain,
        logo: logoPath,
        createdAt: new Date(),
      },
      { spaces: 2 }
    );

    // =========================
    // 4. BACKEND ENV
    // =========================
    const backendEnv = `
PORT=5000
ORG_NAME=${orgSlug}
ORG_EMAIL=${organization.email}
JWT_SECRET=${organization.name.split(" ")[0]}SecretKey
JWT_EXPIRES_TIME=7d
NEW_DB_LOCAL_URI=${process.env.CREATER_ORGANIZATION_URI}${orgSlug}
`;

    await fs.writeFile(
      path.join(backendDestination, ".env"),
      backendEnv.trim()
    );

    // =========================
    // 5. FRONTEND CONFIG
    // =========================
    await fs.writeJson(
      path.join(frontendDestination, "config.json"),
      {
        API_URL: `https://${orgDomain}/api/v1`,
        ORG_NAME: organization.name,
        LOGO: logoPath,
      },
      { spaces: 2 }
    );

    // =========================
    // 6. DOCKER DEPLOYMENT (IMPORTANT PART)
    // =========================
    const containerName = `${orgSlug}-backend`;

    const dockerCmd = `
docker stop ${containerName} || true &&
docker rm ${containerName} || true &&
docker run -d \
  --name ${containerName} \
  --restart always \
  -p ${organization.portNumber}:5000 \
  --env-file ${orgPath}/backend/.env \
  org-backend:latest
`;

    exec(dockerCmd, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Docker error:", err.message);
        return;
      }

      console.log("✅ Docker container started:", containerName);
    });

    console.log("✔ Organization structure created successfully");
  } catch (error) {
    console.log("Organization setup error:", error);
    throw error;
  }
};

module.exports = createOrganizationStructure;