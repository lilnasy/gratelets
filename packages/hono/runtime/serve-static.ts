/*
Forked from https://github.com/honojs/node-server/blob/3575d60/src/serve-static.ts
to add support for an absolute path as "root" and cache-control headers.

In total, 6 lines are changed:
- let path = getFilePath({
+ const path = ((globalThis as any).process.platform === "win32" ? "" : "/") + getFilePath({
- path = `./${path}`
+ c.header("Cache-Control", "public, max-age=31536000, immutable")
+ c.header("Cache-Control", "public, max-age=31536000, immutable")
+ c.header("Vary", "Range")

MIT License

Copyright (c) 2021 - present, Yusuke Wada and Hono contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import type { MiddlewareHandler } from "hono"
import { type ReadStream, createReadStream, existsSync, lstatSync } from "node:fs"
import { getFilePath } from "hono/utils/filepath"
import { getMimeType } from "hono/utils/mime"

export type ServeStaticOptions = {
    /**
     * Root path, relative to current working directory. (absolute paths are not supported)
     */
    root?: string
    path?: string
    index?: string // default is "index.html"
    rewriteRequestPath?: (path: string) => string
}

const createStreamBody = (stream: ReadStream) => {
    const body = new ReadableStream({
        start(controller) {
            stream.on("data", (chunk) => {
                controller.enqueue(chunk)
            })
            stream.on("end", () => {
                controller.close()
            })
        },

        cancel() {
            stream.destroy()
        },
    })
    return body
}

export const serveStatic = (options: ServeStaticOptions = { root: "" }): MiddlewareHandler => {
    return async (c, next) => {
        // Do nothing if Response is already set
        if (c.finalized) return next()

        const url = new URL(c.req.url)

        const filename = options.path ?? decodeURIComponent(url.pathname)
        const path = ((globalThis as any).process.platform === "win32" ? "" : "/") + getFilePath({
            filename: options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename,
            root: options.root,
            defaultDocument: options.index ?? "index.html",
        })

        if (!path) return next()

        if (!existsSync(path)) {
            return next()
        }

        const mimeType = getMimeType(path)
        if (mimeType) {
            c.header("Content-Type", mimeType)
        }

        const stat = lstatSync(path)
        const size = stat.size

        if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
            c.header("Content-Length", size.toString())
            c.status(200)
            return c.body(null)
        }

        const range = c.req.header("range") || ""

        if (!range) {
            c.header("Content-Length", size.toString())
            c.header("Cache-Control", "public, max-age=31536000, immutable")
            return c.body(createStreamBody(createReadStream(path)), 200)
        }

        c.header("Accept-Ranges", "bytes")
        c.header("Date", stat.birthtime.toUTCString())

        const parts = range.replace(/bytes=/, "").split("-", 2)
        const start = parts[0] ? parseInt(parts[0], 10) : 0
        let end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
        if (size < end - start + 1) {
            end = size - 1
        }

        const chunksize = end - start + 1
        const stream = createReadStream(path, { start, end })

        c.header("Content-Length", chunksize.toString())
        c.header("Content-Range", `bytes ${start}-${end}/${stat.size}`)
        c.header("Cache-Control", "public, max-age=31536000, immutable")
        c.header("Vary", "Range")
        return c.body(createStreamBody(stream), 206)
    }
}