#!/usr/bin/env node
import { fileURLToPath } from "url";
import { join, dirname } from "path";
const nodemon = require('nodemon')

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticPath = join(__dirname, 'static');

async function fileResponse(req) {
  const pathname = new URL(req.url).pathname
  const filePath = join(staticPath, pathname);

  try {
    const file = Bun.file(filePath)
    await file.stat()
    return new Response(file)
  } catch (e) {
    return new Response("Not Found", { status: 404 })
  }
}

const index = require(process.cwd() + "/src/index")
const port = 3000

function main() {
  console.log("listening on port", port)
  Bun.serve({
    port: port,
    fetch: async (req, server) => {
      if (server.upgrade(req)) {
        console.log("upgrading!")
        return; // do not return a Response
      }
      const res = await index.default.fetch(req)
      if(res) {
        return res
      }
      return fileResponse(req)
    },
    websocket: {
        message(ws, message) {}, // a message is received
    }
  })
}

const inputPath = process.env.TEMPLATE_DIR || './src'
if(process.argv.indexOf('-w') < 0) {
  main()
} else {
  nodemon({
    watch: [inputPath],
    exec: 'bun run bun-adapter'
  });
}
