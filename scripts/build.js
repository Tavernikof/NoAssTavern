#!/usr/bin/env node
import fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";

const HASH_FILENAME = ".checksum";

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fp = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fp) : [fp];
  });
}

function calcHash(dir) {
  const hash = crypto.createHash("md5");
  listFiles(dir).forEach(file => {
    const content = fs.readFileSync(file);
    hash.update(content);
  });
  return hash.digest("hex");
}

function buildIfNeeded(project, srcDir, distDir) {
  const hashPath = path.resolve(distDir, HASH_FILENAME);

  const newHash = calcHash(srcDir);
  let oldHash = null;

  if (fs.existsSync(hashPath)) {
    oldHash = fs.readFileSync(hashPath, "utf8");
  }

  if (newHash !== oldHash) {
    console.log(`[${project}] 🔨 Building ...`);
    execSync(`yarn workspace noasstavern-${project} build`, { stdio: "inherit" });
    fs.writeFileSync(hashPath, newHash, "utf8");
  }
}

function main() {
  const frontendSrcDir = path.resolve("packages", "frontend", "src");
  const frontendDistDir = path.resolve("packages", "frontend", "dist");
  buildIfNeeded("frontend", frontendSrcDir, frontendDistDir);

  const backendSrcDir = path.resolve("packages", "backend", "src");
  const backendDistDir = path.resolve("packages", "backend", "dist");
  buildIfNeeded("backend", backendSrcDir, backendDistDir);

  const docsSrcDir = path.resolve("packages", "docs", "ru");
  const docsDistDir = path.resolve("packages", "docs", ".vitepress", "dist");
  buildIfNeeded("docs", docsSrcDir, docsDistDir);
}

main();