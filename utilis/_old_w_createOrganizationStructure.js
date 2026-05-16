const fs = require("fs-extra");
const path = require("path");

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
    // CREATE STRUCTURE
    // =========================
    await fs.ensureDir(orgPath);
    await fs.copy(backendTemplate, backendDestination);
    await fs.copy(frontendTemplate, frontendDestination);

    // =========================
    // LOGO HANDLING
    // =========================
    let logoPath = null;

    if (file) {
      const logoDir = path.join(orgPath, "assets", "logos");
      await fs.ensureDir(logoDir);

      logoPath = `/assets/logos/${file.filename}`;

      await fs.copy(file.path, path.join(logoDir, file.filename));
    }

    // =========================
    // ORGANIZATION CONFIG
    // =========================
    const configData = {
      organizationName: organization.name,
      email: organization.email,
      category: organization.category,
      portNumber: organization.portNumber,
      domain: orgDomain,
      logo: logoPath,
      createdAt: new Date(),
    };

    await fs.writeJson(
      path.join(orgPath, "organization.json"),
      configData,
      { spaces: 2 }
    );

    // =========================
    // SETUP SCRIPT
    // =========================
    const setupData = `#!/bin/bash

ORG_NAME=${orgSlug}
ORG_DOMAIN=${orgDomain}
PORT=${organization.portNumber}
EMAIL=${organization.email}

BASE_PATH="/var/www/organizations/$ORG_NAME"

echo "======================================="
echo "Deploying: $ORG_DOMAIN"
echo "======================================="

# =========================
# BACKEND
# =========================
cd $BASE_PATH/backend || exit

npm install

# Safe PM2 restart
pm2 stop $ORG_NAME || true
pm2 delete $ORG_NAME || true
pm2 start server.js --name $ORG_NAME
pm2 save

# =========================
# NGINX CONFIG
# =========================
sudo tee /etc/nginx/sites-available/$ORG_DOMAIN > /dev/null <<EOF
server {
    listen 80;
    server_name $ORG_DOMAIN;

    root $BASE_PATH/frontend;
    index index.html;

    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;

        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;

        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$ORG_DOMAIN /etc/nginx/sites-enabled/$ORG_DOMAIN

# Test nginx
sudo nginx -t || { echo "NGINX config failed"; exit 1; }

sudo systemctl reload nginx

# =========================
# SSL (Certbot)
# =========================
echo "Generating SSL..."

sudo certbot --nginx \
  -d $ORG_DOMAIN \
  --non-interactive \
  --agree-tos \
  -m $EMAIL \
  --redirect || {
    echo "SSL generation failed but continuing..."
}

sudo systemctl reload nginx

echo "======================================="
echo "Deployment completed successfully!"
echo "https://$ORG_DOMAIN"
echo "======================================="
`;

    await fs.writeFile(
      path.join(orgPath, "setup.sh"),
      setupData.trim(),
      { mode: 0o755 }
    );

    // =========================
    // BACKEND ENV
    // =========================
    const backendEnv = `
PORT=${organization.portNumber}
ORG_NAME=${orgSlug}
ORG_EMAIL=${organization.email}
JWT_SECRET=${organization.name.split(" ")[0]}SecretKey
JWT_EXPIRES_TIME=7d
NEW_DB_LOCAL_URI=${process.env.CREATER_ORGANIZATION_URI}${orgSlug}?ssl=true&replicaSet=atlas-89v3w5-shard-0&authSource=admin&appName=wattninventryadmin
`;

    await fs.writeFile(
      path.join(backendDestination, ".env"),
      backendEnv.trim()
    );

    // =========================
    // FRONTEND CONFIG
    // =========================
    const frontendConfig = {
      API_URL: `https://${orgDomain}/api/v1`,
      ORG_NAME: organization.name,
      LOGO: logoPath,
    };

    await fs.writeJson(
      path.join(frontendDestination, "config.json"),
      frontendConfig,
      { spaces: 2 }
    );

    console.log("✔ Organization structure created successfully");
  } catch (error) {
    console.log("Organization setup error:", error);
    throw error;
  }
};

module.exports = createOrganizationStructure;