#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const util = require('util')
const nodemon = require('nodemon')

function readDir(directoryPath, prefix, out) {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    // Check if the current item is a file (not a subdirectory)
    if (fs.statSync(filePath).isFile()) {
      // Read the content of the file
      out[prefix+file.split(".")[0]] = fs.readFileSync(filePath, 'utf8');
    } else if(fs.statSync(filePath).isDirectory()) {
      readDir(filePath, prefix+file+"-", out)
    }
  }
}


const inputPath = process.env.TEMPLATE_DIR || './views'
function build() {
  try {
    const outputPath = process.env.FILES_FILE || './src/files.js'
    console.log("buliding", inputPath, "into", outputPath)
    const output = fs.createWriteStream(outputPath, { flags: 'w' })
    const fileMap = {}
    readDir(inputPath, "", fileMap)
    const content = `const files = ${util.inspect(fileMap)}
  export default files`
    output.end(content, err => {
      if(err) {
        console.error(err)
      }
    })
  } catch (err) {
    console.error('Error:', err);
  }
}

if(process.argv.indexOf('-w') < 0) {
  build()
} else {
  nodemon({
    watch: [inputPath],
    ext: 'html',
    exec: 'bun run build-views'
  });
}
