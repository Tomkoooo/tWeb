#!/usr/bin/env node
import { promises as fs } from "node:fs"
import path from "node:path"
import process from "node:process"

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith("--id=")) out.id = arg.slice("--id=".length)
    else if (arg === "--id") out.id = argv[++i]
    else if (arg.startsWith("--base=")) out.base = arg.slice("--base=".length)
    else if (arg === "--base") out.base = argv[++i]
    else if (arg.startsWith("--name=")) out.name = arg.slice("--name=".length)
    else if (arg === "--name") out.name = argv[++i]
    else if (arg.startsWith("--deployment=")) out.deployment = arg.slice("--deployment=".length)
    else if (arg === "--deployment") out.deployment = argv[++i]
  }
  return out
}

const VALID_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function rewriteManifest(filePath, id, name, deployment) {
  const original = await fs.readFile(filePath, "utf8")
  let updated = original.replace(/id:\s*"[^"]+"/, `id: "${id}"`)
  updated = updated.replace(/name:\s*"[^"]+"/, `name: "${name}"`)
  updated = updated.replace(
    /screenshots:\s*\[[^\]]*\]/,
    `screenshots: ["/template-previews/${id}.svg"]`
  )
  if (!/deployment:\s*"[^"]+"/m.test(updated)) {
    updated = updated.replace(
      /(\s+surfaces:\s*DEFAULT_TEMPLATE_SURFACES,)/m,
      `$1\n    deployment: "${deployment}",`
    )
  } else {
    updated = updated.replace(/deployment:\s*"[^"]+"/m, `deployment: "${deployment}"`)
  }
  if (deployment === "landing") {
    updated = updated.replace(/restyles:\s*\[[^\]]*\]/m, `restyles: ["home"]`)
  }
  await fs.writeFile(filePath, updated, "utf8")
}

async function registerInRegistry(id) {
  const registryPath = path.join(process.cwd(), "src", "templates", "registry.ts")
  const original = await fs.readFile(registryPath, "utf8")
  if (original.includes(`"${id}":`)) {
    console.log(`[create-template] '${id}' already in registry — skipping registry update.`)
    return
  }
  const importVarName = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const newImport = `import { ${importVarName} } from "./${id}/template.config"`
  const importedAlready = new RegExp(`from "\\./${id}/template\\.config"`).test(original)
  let updated = original
  if (!importedAlready) {
    updated = updated.replace(
      /(import \{ [a-zA-Z]+ \} from "\.\/[^"]+\/template\.config"\n)+/,
      (match) => match + newImport + "\n"
    )
  }
  updated = updated.replace(
    /export const TEMPLATE_REGISTRY: Record<string, TemplateModule> = \{([\s\S]*?)\}/,
    (_match, body) => {
      const trimmed = body.replace(/\n\s*$/, "")
      return `export const TEMPLATE_REGISTRY: Record<string, TemplateModule> = {${trimmed}\n  "${id}": ${importVarName},\n}`
    }
  )
  await fs.writeFile(registryPath, updated, "utf8")
  console.log(`[create-template] Registered '${id}' in src/templates/registry.ts`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const id = args.id?.trim()
  const baseId = (args.base ?? "default-modern").trim()
  const deploymentRaw = args.deployment?.trim().toLowerCase()
  if (
    deploymentRaw &&
    deploymentRaw !== "landing" &&
    deploymentRaw !== "commerce"
  ) {
    console.error("--deployment must be 'landing' or 'commerce'.")
    process.exit(1)
  }
  const deployment = deploymentRaw === "landing" ? "landing" : "commerce"
  const name =
    args.name?.trim() ||
    (id
      ? id
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "")

  if (!id) {
    console.error(
      'Missing --id. Usage: npm run create-template -- --id=my-template [--base=default-modern] [--name="My Template"] [--deployment=commerce|landing]'
    )
    process.exit(1)
  }
  if (!VALID_ID.test(id)) {
    console.error(`Invalid id '${id}'. Must be lowercase letters, digits, hyphens (e.g. "my-template").`)
    process.exit(1)
  }

  const cwd = process.cwd()
  const baseDir = path.join(cwd, "src", "templates", baseId)
  const newDir = path.join(cwd, "src", "templates", id)

  try {
    await fs.access(baseDir)
  } catch {
    console.error(`Base template '${baseId}' not found at ${baseDir}.`)
    process.exit(1)
  }
  try {
    await fs.access(newDir)
    console.error(`Destination already exists: ${newDir}.`)
    process.exit(1)
  } catch {
    // expected
  }

  console.log(`[create-template] Copying ${baseId} → ${id}`)
  await copyDir(baseDir, newDir)

  const configPath = path.join(newDir, "template.config.ts")
  await rewriteManifest(configPath, id, name, deployment)

  await registerInRegistry(id)

  console.log(`[create-template] Done.`)
  console.log(`[create-template] Next steps:`)
  console.log(`  1. Edit ${path.relative(cwd, configPath)} (description, version, deployment).`)
  console.log(
    `  2. Customize every surface — not only chrome: chrome/Navbar + Footer; pages/home, shop, pdp Render; each static-pages/*/Render; pages/flow/FlowWrappers + flowPages in template.config; theme.ts / defaultTheme; optional commerceSlots.ProductCard.`
  )
  console.log(
    `  3. CMS: keep pages.home.cmsPageKind "homepage-blocks" + homepageSnapshotSchema when copying default-modern; /admin/cms lists only the homepage (shop/PDP/static/flow have no admin editor in this engine).`
  )
  console.log(`  4. Add public/template-previews/${id}.svg (manifest screenshots).`)
  console.log(`  5. Run: npm run test:unit -- templates-contract`)
  console.log(`  6. Run: npx eslint src/templates/${id}`)
  console.log(`  7. Run npm run dev and visit /admin/templates — confirm /admin/cms/home block editor.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
