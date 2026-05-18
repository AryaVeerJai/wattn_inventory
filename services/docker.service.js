"use strict";

const { runDocker } = require("../utilis/shell");
const { orgPaths } = require("./filesystem.service");

/**
 * Stop and remove any existing container with this name, then start a fresh one.
 *
 * All arguments are passed as an array to execFile — no shell is involved,
 * so portNumber, containerName, etc. cannot be used for injection even if
 * they somehow bypassed the earlier validator.
 */
async function startOrgContainer(slug, { portNumber }) {
  const containerName = `${slug}-backend`;
  const { orgPath } = orgPaths(slug);
  const envFilePath = `${orgPath}/backend/.env`;

  // Stop existing container if present (ignore errors — it may not exist)
  await runDocker(["stop", containerName]).catch(() => {});
  await runDocker(["rm", containerName]).catch(() => {});

  // Start new container
  await runDocker([
    "run", "-d",
    "--name", containerName,
    "--restart", "always",
    "-p", `${portNumber}:5000`,
    "--env-file", envFilePath,
    "org-backend:latest",
  ]);

  return containerName;
}

/**
 * Stop and remove the container — used during rollback.
 */
async function removeOrgContainer(slug) {
  const containerName = `${slug}-backend`;
  await runDocker(["stop", containerName]).catch(() => {});
  await runDocker(["rm", containerName]).catch(() => {});
}

module.exports = { startOrgContainer, removeOrgContainer };
