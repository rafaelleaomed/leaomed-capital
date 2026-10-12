const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

require.extensions['.ts'] = (module, filename) => {
  const root = path.resolve(__dirname, '..')
  const source = fs.readFileSync(filename, 'utf8').replace(/from ['"]@\/([^'"]+)['"]/g, (_, relative) => `from ${JSON.stringify(path.join(root, relative))}`)
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  })
  module._compile(outputText, filename)
}
