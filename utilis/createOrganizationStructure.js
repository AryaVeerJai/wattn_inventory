const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// IMPORTANT: use schema version (NOT model)
const { userSchema } = require("../models/user.schema");

const createOrganizationStructure = async (organization, file) => {
  try {
    const orgSlug = organization.name.toLowerCase().replace(/\s+/g, "-");
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
    // 1. CREATE FOLDER STRUCTURE
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
    // 3. ORGANIZATION CONFIG
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
NEW_DB_LOCAL_URI=${process.env.CREATER_ORGANIZATION_URI}/${orgSlug}
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
    // 6. START DOCKER CONTAINER
    // =========================
    const containerName = `${orgSlug}-backend`;

    exec(`
docker stop ${containerName} || true &&
docker rm ${containerName} || true &&
docker run -d \
  --name ${containerName} \
  --restart always \
  -p ${organization.portNumber}:5000 \
  --env-file ${orgPath}/backend/.env \
  org-backend:latest
`, (err) => {
      if (err) {
        console.log("❌ Docker error:", err.message);
      } else {
        console.log("✔ Docker started:", containerName);
      }
    });

    // =========================
    // 7. CREATE FIRST USER (ORG DB)
    // =========================
    const orgDbUri = `${process.env.CREATER_ORGANIZATION_URI}/${orgSlug}`;

    const orgConnection = mongoose.createConnection(orgDbUri);

    const User = orgConnection.model("User", userSchema);

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: organization.name + " Admin",
      email: organization.email,
      password: hashedPassword,
      role: "OWNER",
      isVerified: true,
    });

    console.log("✔ First org user created");

    // =========================
    // 8. NGINX AUTO CONFIG (FIXED CRITICAL PART)
    // =========================
    const nginxConfig = `
server {
    listen 80;
    server_name ${orgDomain};

    location / {
        proxy_pass http://localhost:${organization.portNumber};
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
`;

    const nginxPath = `/etc/nginx/sites-available/${orgDomain}`;

    await fs.writeFile(nginxPath, nginxConfig);

    exec(`
ln -sf /etc/nginx/sites-available/${orgDomain} /etc/nginx/sites-enabled/${orgDomain} &&
nginx -t && systemctl reload nginx
`, (err) => {
      if (err) {
        console.log("❌ Nginx error:", err.message);
      } else {
        console.log("✔ Nginx enabled:", orgDomain);
      }
    });

    console.log("🎉 Organization setup completed successfully");
  } catch (error) {
    console.log("❌ Organization setup error:", error);
    throw error;
  }
};

module.exports = createOrganizationStructure;