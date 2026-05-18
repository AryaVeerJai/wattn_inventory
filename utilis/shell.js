"use strict";

const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

/**
 * Run docker with a fixed argument array (no shell interpolation).
 * Each argument is passed directly to execFile, so shell metacharacters
 * in org data cannot escape into the command.
 */
async function runDocker(args, { timeout = 30_000 } = {}) {
  const { stdout, stderr } = await execFileAsync("docker", args, { timeout });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

/**
 * Run nginx config test + reload.
 * Uses execFile with a fixed argv — no user data is interpolated.
 */
async function reloadNginx({ timeout = 15_000 } = {}) {
  await execFileAsync("nginx", ["-t"], { timeout });
  await execFileAsync("systemctl", ["reload", "nginx"], { timeout });
}

/**
 * Create an nginx symlink via execFile (ln -sf src dest).
 * Both paths are constructed in JS and validated before reaching here.
 */
async function createNginxSymlink(src, dest, { timeout = 10_000 } = {}) {
  await execFileAsync("ln", ["-sf", src, dest], { timeout });
}

module.exports = { runDocker, reloadNginx, createNginxSymlink };
