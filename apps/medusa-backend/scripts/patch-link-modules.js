const fs = require('fs')
const path = require('path')

const medusaDir = path.join(__dirname, '..', 'node_modules', '@medusajs', 'medusa')
const linkModulesPath = path.join(medusaDir, 'link-modules.js')

const content = `// Patched so require('@medusajs/medusa/link-modules') resolves
module.exports = require('@medusajs/link-modules')
`

try {
  if (!fs.existsSync(medusaDir)) {
    console.warn('patch-link-modules: @medusajs/medusa not found, skip')
    process.exit(0)
  }
  fs.writeFileSync(linkModulesPath, content)
  console.log('patch-link-modules: wrote link-modules.js')
} catch (e) {
  console.warn('patch-link-modules:', e.message)
}

process.exit(0)
