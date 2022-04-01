// @ts-check
const fs = require('fs')
const path = require('path')

mvContentsSync(path.join(__dirname, '../baselines/local'), path.join(__dirname, '../baselines/reference'))

function mvContentsSync(src, dest) {
  if (fs.existsSync(src)) {
    fs.readdirSync(src).forEach(file => {
      const curPath = path.join(src, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        mvContentsSync(curPath, path.join(dest, file))
      } else {
        fs.renameSync(curPath, path.join(dest, file))
      }
    })
    fs.rmdirSync(src)
  }
}
