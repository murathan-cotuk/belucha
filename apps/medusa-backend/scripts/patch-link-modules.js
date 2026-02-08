const fs = require('fs')
const path = require('path')

const content = "module.exports = require('@medusajs/link-modules')\n"

function findMedusaDirs(startDir, maxDepth = 10) {
  const found = new Set()
  let dir = startDir
  let depth = 0
  while (dir && depth < maxDepth) {
    const medusaDir = path.join(dir, 'node_modules', '@medusajs', 'medusa')
    if (fs.existsSync(medusaDir)) found.add(medusaDir)
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
    depth++
  }
  return found
}

// Script is at apps/medusa-backend/scripts/ — repo root is ../../..
const repoRoot = path.resolve(__dirname, '..', '..', '..')
const rootMedusa = path.join(repoRoot, 'node_modules', '@medusajs', 'medusa')

const fromScript = findMedusaDirs(__dirname)
const fromCwd = findMedusaDirs(process.cwd())
const medusaDirs = [...new Set([...fromScript, ...fromCwd, ...(fs.existsSync(rootMedusa) ? [rootMedusa] : [])])]

let written = false
for (const medusaDir of medusaDirs) {
  const filePath = path.join(medusaDir, 'link-modules.js')
  try {
    fs.writeFileSync(filePath, content)
    console.log('patch-link-modules: wrote', medusaDir)
    written = true
  } catch (e) {
    console.error('patch-link-modules: failed to write', filePath, e.message)
    process.exit(1)
  }

  const pkgPath = path.join(medusaDir, 'package.json')
  try {
    const pkgRaw = fs.readFileSync(pkgPath, 'utf8')
    const pkg = JSON.parse(pkgRaw)
    if (!pkg.exports) pkg.exports = {}
    if (typeof pkg.exports === 'object' && !Array.isArray(pkg.exports)) {
      pkg.exports['./link-modules'] = './link-modules.js'
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
      console.log('patch-link-modules: updated exports in', pkgPath)
    }
  } catch (e) {
    console.error('patch-link-modules: failed to update package.json', pkgPath, e.message)
    process.exit(1)
  }
}
if (!written) {
  console.error('patch-link-modules: @medusajs/medusa not found (walked from __dirname and cwd)')
  process.exit(1)
}
process.exit(0)
