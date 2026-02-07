const fs = require('fs')
const path = require('path')

const content = "module.exports = require('@medusajs/link-modules')\n"

const backends = [
  path.join(__dirname, '..', 'node_modules', '@medusajs', 'medusa'),
  path.join(__dirname, '..', '..', '..', 'node_modules', '@medusajs', 'medusa'),
]

let written = false
for (const medusaDir of backends) {
  if (fs.existsSync(medusaDir)) {
    try {
      fs.writeFileSync(path.join(medusaDir, 'link-modules.js'), content)
      console.log('patch-link-modules: wrote', medusaDir)
      written = true
    } catch (e) {
      console.warn('patch-link-modules:', e.message)
    }
  }
}
if (!written) {
  console.warn('patch-link-modules: @medusajs/medusa not found in backend or root node_modules, skip')
}

process.exit(0)
