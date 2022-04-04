// @ts-check
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('npm run build')
execSync('npm run build', { stdio: 'inherit' })

console.log('rm -rf baselines/local')
rimraf(path.join(__dirname, '../baselines/local'))

function rimraf(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(file => {
      const curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        rimraf(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

