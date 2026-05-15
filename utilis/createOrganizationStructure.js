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

    const setupData = `#!/bin/bash

ORG_NAME=${orgSlug}
PORT=${organization.portNumber}
EMAIL=${organization.email}

if [ -z "$ORG_NAME" ] || [ -z "$PORT" ] || [ -z "$EMAIL" ]; then
  echo "Usage: ./setup.sh <domain> <port> <email>"
  exit 1
fi

BASE_PATH="/var/www/organizations/$ORG_NAME"

echo "======================================="
echo "Deploying: $ORG_NAME"
echo "======================================="

# ============================================
# Backend Setup
# ============================================

cd $BASE_PATH/backend || exit

echo "Installing backend dependencies..."

npm install

echo "Starting PM2..."

pm2 start server.js --name $ORG_NAME

pm2 save

# ============================================
# Create NGINX Config (HTTP First)
# ============================================

echo "Creating nginx config..."

sudo tee /etc/nginx/sites-available/$ORG_NAME.protobiz.ai > /dev/null <<EOF
server {
    listen 80;

    server_name $ORG_NAME;

    root $BASE_PATH/frontend;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;

        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;

        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# ============================================
# Enable Site
# ============================================

sudo ln -sf /etc/nginx/sites-available/$ORG_NAME /etc/nginx/sites-enabled/

# ============================================
# Test NGINX
# ============================================

echo "Testing nginx..."

sudo nginx -t

if [ $? -ne 0 ]; then
  echo "NGINX configuration failed!"
  exit 1
fi

# ============================================
# Reload NGINX
# ============================================

sudo systemctl reload nginx

# ============================================
# Generate SSL
# ============================================

echo "Generating SSL certificate..."

sudo certbot --nginx \
  -d $ORG_NAME \
  --non-interactive \
  --agree-tos \
  -m $EMAIL \
  --redirect

# ============================================
# Reload Again
# ============================================

sudo systemctl reload nginx

echo "======================================="
echo "Deployment completed successfully!"
echo "https://$ORG_NAME"
echo "======================================="
      `;

      await fs.writeFile(
        path.join(orgPath, "setup.sh"),
        setupData.trim(),
        { mode: 0o755 }
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