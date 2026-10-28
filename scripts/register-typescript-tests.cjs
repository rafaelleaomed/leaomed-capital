const fs = require('node:fs')
const path = require('node:path')
const { transformSync } = require('next/dist/build/swc')

function compileTypeScript(source, filename) {
  const tsx = filename.endsWith('.tsx')
  return transformSync(source, {
    filename,
    jsc: {
      parser: { syntax: 'typescript', tsx },
      target: 'es2020',
      transform: tsx ? { react: { runtime: 'automatic' } } : undefined,
    },
    module: { type: 'commonjs' },
  }).code
}

function registerTypeScriptTests() {
  const root = path.resolve(__dirname, '..')
  for (const extension of ['.ts', '.tsx']) {
    require.extensions[extension] = (module, filename) => {
      const source = fs.readFileSync(filename, 'utf8').replace(/from ['"]@\/([^'"]+)['"]/g, (_, relative) => `from ${JSON.stringify(path.join(root, relative))}`)
      module._compile(compileTypeScript(source, filename), filename)
    }
  }
}

registerTypeScriptTests()

module.exports = { compileTypeScript, registerTypeScriptTests }
