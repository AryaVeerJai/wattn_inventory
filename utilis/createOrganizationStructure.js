// const fs = require("fs-extra");
// const path = require("path");

// const createOrganizationStructure = async (organization) => {
//   try {
//     const orgSlug = organization.name
//       .toLowerCase()
//       .replace(/\s+/g, "-");

//     // Main organization folder
//     const orgPath = path.join(
//       __dirname,
//       "..",
//       "..",
//       "organizations",
//       orgSlug
//     );

//     // Template paths
//     const backendTemplate = path.join(
//       __dirname,
//       "..",
//       "templates",
//       "backend-template"
//     );

//     const frontendTemplate = path.join(
//       __dirname,
//       "..",
//       "templates",
//       "frontend-template"
//     );

//     // Destination paths
//     const backendDestination = path.join(orgPath, "backend");
//     const frontendDestination = path.join(orgPath, "frontend");

//     // Create organization folder
//     await fs.ensureDir(orgPath);

//     // Copy backend template
//     await fs.copy(backendTemplate, backendDestination);

//     // Copy frontend template
//     await fs.copy(frontendTemplate, frontendDestination);

//     // Create organization config file
//     const configData = {
//       organizationName: organization.name,
//       email: organization.email,
//       category: organization.category,
//       portNumber: organization.portNumber,
//       createdAt: new Date(),
//     };

//     await fs.writeJson(
//       path.join(orgPath, "organization.json"),
//       configData,
//       { spaces: 2 }
//     );

//     // Create backend .env dynamically
//     const backendEnv = `
// PORT=${organization.portNumber}
// ORG_NAME=${organization.name}
// ORG_EMAIL=${organization.email}
// NEW_DB_LOCAL_URI=${process.env.CREATER_ORGANIZATION_URI}${orgSlug}?ssl=true&replicaSet=atlas-89v3w5-shard-0&authSource=admin&appName=wattninventryadmin
// `;

//     await fs.writeFile(
//       path.join(backendDestination, ".env"),
//       backendEnv
//     );

//     // Create frontend .env dynamically
//     const frontendEnv = `
//   {
//     "API_URL": "http://localhost:5001/api/v1"
//   }
// `;

//     await fs.writeFile(
//       path.join(frontendDestination, "config.json"),
//       frontendEnv
//     );

//     console.log("Organization structure created successfully");
//   } catch (error) {
//     console.log("Organization setup error:", error);
//     throw error;
//   }
// };

// module.exports = createOrganizationStructure;


const fs = require("fs-extra");
const path = require("path");

const createOrganizationStructure = async (organization, file) => {
  try {
    const orgSlug = organization.name
      .toLowerCase()
      .replace(/\s+/g, "-");

    // Root org folder
    const orgPath = path.join(
      __dirname,
      "..",
      "..",
      "organizations",
      orgSlug
    );

    // Templates
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

    // Create folders
    await fs.ensureDir(orgPath);

    // Copy templates
    await fs.copy(backendTemplate, backendDestination);
    await fs.copy(frontendTemplate, frontendDestination);

    // =========================
    // 📦 LOGO HANDLING (NEW)
    // =========================
    if (file) {
      const logoDir = path.join(orgPath, "assets", "logos");
      await fs.ensureDir(logoDir);

      await fs.copy(
        file.path,
        path.join(logoDir, file.filename)
      );
    }

    // =========================
    // 📄 ORGANIZATION CONFIG
    // =========================
    const configData = {
      organizationName: organization.name,
      email: organization.email,
      category: organization.category,
      portNumber: organization.portNumber,
      logo: file ? `/assets/logos/${file.filename}` : null,
      createdAt: new Date(),
    };

    await fs.writeJson(
      path.join(orgPath, "organization.json"),
      configData,
      { spaces: 2 }
    );

    // =========================
    // 🖥 BACKEND .ENV
    // =========================
    const backendEnv = `
PORT=${organization.portNumber}
ORG_NAME=${organization.name}
ORG_EMAIL=${organization.email}
NEW_DB_LOCAL_URI=${process.env.CREATER_ORGANIZATION_URI}${orgSlug}?ssl=true&replicaSet=atlas-89v3w5-shard-0&authSource=admin&appName=wattninventryadmin
`;

    await fs.writeFile(
      path.join(backendDestination, ".env"),
      backendEnv.trim()
    );

    // =========================
    // 🌐 FRONTEND CONFIG (FIXED)
    // =========================
    const frontendConfig = {
      API_URL: `http://localhost:${organization.portNumber}/api/v1`,
      ORG_NAME: organization.name,
      LOGO: file ? `/assets/logos/${file.filename}` : null
    };

    const frontendConfigPath = path.join(frontendDestination, "config.json");

    await fs.writeJson(
      frontendConfigPath,
      frontendConfig,
      { spaces: 2 }
    );

    console.log("Organization structure created successfully ✔");

  } catch (error) {
    console.log("Organization setup error:", error);
    throw error;
  }
};

module.exports = createOrganizationStructure;