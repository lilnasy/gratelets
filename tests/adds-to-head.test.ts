import { describe, beforeAll, afterAll, test, expect } from "vitest"
import { build, dev, type BuildFixture } from "./utils.ts"

const styleRegex = /<style>p\[data-astro-cid-.{8}]{background-color:salmon}\n?<\/style>/
const devScriptRegex = /<script type="module" src="(?<src>[/_.?&=a-zA-Z0-9]*)"><\/script>/

describe("build", () => {
    let fixture: BuildFixture
    
    beforeAll(async () => {
        fixture = await build("./fixtures/adds-to-head")
    })
    
    test("rendered page includes propagated styles and scripts", async () => {
        const html = fixture.readTextFile("index.html")
        expect(html).to.match(styleRegex)
        expect(html).to.include(`<script type="module">console.log("hi");</script>`)
    })
})

describe("dev", () => {
    let devServer : Awaited<ReturnType<typeof dev>>
    
    beforeAll(async () => {
        process.env.NODE_ENV = "development"
        devServer = await dev("./fixtures/adds-to-head")
    })
    
    test("rendered page includes propagated styles and scripts", async () => {
        const htmlResponse = await fetch(`http://localhost:${devServer.address.port}/`)
        const _html = await htmlResponse.text()
        const html = _html.replaceAll("&#38;", "&")
        expect(html).to.match(styleRegex)
        
        // @ts-ignore
        const { groups: { src } } = devScriptRegex.exec(html)
        const jsResponse = await fetch(`http://localhost:${devServer.address.port}${src}`)
        const js = await jsResponse.text()
        expect(js).to.include(`console.log("hi");`)
    })
    
    afterAll(async () => {
        await devServer.stop()
    })
})
