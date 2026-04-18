#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const typesDir = join(projectRoot, "types", "nevermore");
const nodeModulesQuenty = join(projectRoot, "node_modules", "@quenty");

if (!existsSync(nodeModulesQuenty)) {
  console.log("[overlay] node_modules/@quenty not found, skipping");
  process.exit(0);
}

if (!existsSync(typesDir)) {
  console.log("[overlay] types/nevermore not found, skipping");
  process.exit(0);
}

let copied = 0;
let manifestsPatched = 0;

const copyDts = (src, dst) => {
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dst, entry);
    if (statSync(s).isDirectory()) {
      mkdirSync(d, { recursive: true });
      copyDts(s, d);
    } else if (entry.endsWith(".d.ts")) {
      cpSync(s, d);
      copied++;
    }
  }
};

for (const pkg of readdirSync(nodeModulesQuenty)) {
  const pkgDir = join(nodeModulesQuenty, pkg);
  if (!statSync(pkgDir).isDirectory()) continue;
  const source = join(typesDir, pkg);
  if (!existsSync(source)) continue;

  copyDts(source, pkgDir);

  const pkgJson = join(pkgDir, "package.json");
  const rootIndex = join(pkgDir, "index.d.ts");
  if (existsSync(pkgJson) && existsSync(rootIndex)) {
    const manifest = JSON.parse(readFileSync(pkgJson, "utf8"));
    if (manifest.types !== "index.d.ts") {
      manifest.types = "index.d.ts";
      writeFileSync(pkgJson, JSON.stringify(manifest, null, 2) + "\n");
      manifestsPatched++;
    }
  }
}

console.log(`[overlay] Copied ${copied} .d.ts into node_modules/@quenty/ (${manifestsPatched} package.json patched)`);
