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
    const filePath = path.join(medusaDir, 'link-modules.js')
    try {
      fs.writeFileSync(filePath, content)
      console.log('patch-link-modules: wrote', medusaDir)
      written = true
    } catch (e) {
      console.error('patch-link-modules: failed to write', filePath, e.message)
      process.exit(1)
    }
  }
}
if (!written) {
  console.error('patch-link-modules: @medusajs/medusa not found in backend or root node_modules')
  process.exit(1)
}
process.exit(0)
