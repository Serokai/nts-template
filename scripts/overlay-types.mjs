#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const typesDir = join(projectRoot, "types", "nevermore");
const patchesDir = join(projectRoot, "patches", "@quenty");
const nodeModulesQuenty = join(projectRoot, "node_modules", "@quenty");

if (!existsSync(nodeModulesQuenty)) {
  console.log("[overlay] node_modules/@quenty not found, skipping");
  process.exit(0);
}

let typesCopied = 0;
let pkgJsonPatched = 0;

const copyDts = (src, dst) => {
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dst, entry);
    if (statSync(s).isDirectory()) {
      mkdirSync(d, { recursive: true });
      copyDts(s, d);
    } else if (entry.endsWith(".d.ts")) {
      cpSync(s, d);
      typesCopied++;
    }
  }
};

if (existsSync(typesDir)) {
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
        pkgJsonPatched++;
      }
    }
  }
  console.log(
    `[overlay] Copied ${typesCopied} .d.ts files into node_modules/@quenty/ (${pkgJsonPatched} package.json patched)`,
  );
} else {
  console.log(`[overlay] types/nevermore not found, skipping type overlay`);
}

let patchCount = 0;
let patchedPackages = 0;

const copyAll = (src, dst) => {
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dst, entry);
    if (statSync(s).isDirectory()) {
      mkdirSync(d, { recursive: true });
      copyAll(s, d);
    } else {
      mkdirSync(dirname(d), { recursive: true });
      cpSync(s, d);
      patchCount++;
    }
  }
};

if (existsSync(patchesDir)) {
  for (const pkg of readdirSync(patchesDir)) {
    const source = join(patchesDir, pkg);
    if (!statSync(source).isDirectory()) continue;
    const target = join(nodeModulesQuenty, pkg);
    if (!existsSync(target)) {
      console.warn(
        `[overlay] patches/@quenty/${pkg} has no matching package in node_modules, skipping`,
      );
      continue;
    }
    const before = patchCount;
    copyAll(source, target);
    if (patchCount > before) patchedPackages++;
  }
  if (patchCount > 0) {
    console.log(
      `[overlay] Applied ${patchCount} patch files across ${patchedPackages} @quenty package(s)`,
    );
  }
}
