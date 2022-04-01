// @ts-check
const fs = require('fs')
const path = require('path')

rimraf(path.join(__dirname, '../baselines/local'))

function rimraf(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const curPath = path + "/" + file
      if (fs.lstatSync(curPath).isDirectory()) {
        rimraf(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

