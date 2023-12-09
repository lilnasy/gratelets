import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/bad-urls/")

const weirdURLs = [
    "/\\xfs.bxss.me%3Fastrojs.com/hello-world",
    "/asdasdasd@ax_zX=.zxczas🐥%/úadasd000%/",
    "%",
    "%80",
    "%c",
    "%c0%80",
    "%20foobar%"
]

for (const weirdUrl of weirdURLs) {
    test("does not crash on bad url: " + weirdUrl, async ({ expect, server }) => {
        const fetchResult = await fetch("http://localhost:4321/" + weirdUrl)
        expect([404, 500]).to.include(fetchResult.status)
        const stillWork = await fetch("http://localhost:4321/")
        const text = await stillWork.text()
        expect(text).to.equal("<!DOCTYPE html>Hello!")
        server.close()
    })
}
