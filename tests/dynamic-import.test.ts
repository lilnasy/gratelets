import { describe, beforeAll, test, expect } from "vitest"
import { build, dev, type BuildFixture, type DevServer } from "./utils.ts"

const buildScriptRegex = /(?<=<script src=")[\-/_.?&#;=a-zA-Z0-9]*(?=" type="module"><\/script>)/
const devScriptRegex = /(?<=<script type="module" src=")[\-/_.?&=#;a-zA-Z0-9]*(?="><\/script>)/

describe("build", () => {
    let fixture: BuildFixture
    let A: string
    let B: string
    let C: string
    let D: string
    
    beforeAll(async () => {
        fixture = await build("./fixtures/dynamic-import")
        A = fixture.readTextFile("A/index.html")
        B = fixture.readTextFile("B/index.html")
        C = fixture.readTextFile("C/index.html")
        D = fixture.readTextFile("D/index.html")
    })
    
    test("Page A includes styles and scripts from component A", async () => {
        expect(A).to.include("Contents of A")
        expect(A).to.include("background-color:#afeeee")
        const match = buildScriptRegex.exec(A)
        expect(match).to.not.be.null
        const [ src ] = match!
        const js = fixture.readTextFile(`.${src}`)
        expect(js).to.include("script of A")
    })
    
    test("Page B includes styles and scripts from component B", async () => {
        expect(B).to.include("Contents of B")
        expect(B).to.include("background-color:#fff8dc")
        const match = buildScriptRegex.exec(B)
        expect(match).to.not.be.null
        const [ src ] = match!
        const js = fixture.readTextFile(`.${src}`)
        expect(js).to.include("script of B")
    })
    
    test("Assets don't leak into unrelated pages", async () => {
        expect(A).to.not.include("background-color:#fff8dc")
        expect(B).to.not.include("background-color:#afeeee")
        const matches = [...A.matchAll(new RegExp(buildScriptRegex, "g"))]
        expect(matches).to.not.be.empty
        expect(matches).to.have.lengthOf(1)
        const [ scriptA ] = matches!
        {
            const matches = [...B.matchAll(new RegExp(buildScriptRegex, "g"))]
            expect(matches).to.have.lengthOf(1)
            const [ scriptB ] = matches!
            expect(scriptA).to.not.equal(scriptB)
        }
    })

    test("Components in a subfolder can be dynamically imported", async () => {
        expect(C).to.include("Contents of C")
        expect(C).to.include("background-color:#deb887")
        const [ src ] = buildScriptRegex.exec(C)!
        const js = fixture.readTextFile(`.${src}`)
        expect(js).to.include("script of C")
    })

    test("Props can be sent to the component", () => {
        expect(D).to.include("<div>0</div><div>1</div><div>2</div><div>3</div><div>4</div>")
    })
})

describe("dev", () => {
    let server: DevServer
    let A: string
    let B: string
    
    beforeAll(async () => {
        server = await dev("./fixtures/dynamic-import")
    })
    
    test("Page A includes styles and scripts from component A", async () => {
        A = await server.fetch("/A")
        expect(A).to.include("Contents of A")
        expect(A).to.include("background-color:paleturquoise")
        const [ src ] = devScriptRegex.exec(A)!
        const js = await server.fetch(src)
        expect(js).to.include("script of A")
    })
    
    test("Page B includes styles and scripts from component B", async () => {
        B = await server.fetch("/B")
        expect(B).to.include("Contents of B")
        expect(B).to.include("background-color:cornsilk")
        const [ src ] = devScriptRegex.exec(B)!
        const js = await server.fetch(src)
        expect(js).to.include("script of B")
    })
    
    test("Assets don't leak into unrelated pages", async () => {
        expect(A).to.not.include("background-color:#fff8dc")
        expect(B).to.not.include("background-color:#afeeee")
        const matches = devScriptRegex.exec(A)
        expect(matches).to.have.lengthOf(1)
        const [ scriptA ] = matches!
        {
            const matches = devScriptRegex.exec(B)
            expect(matches).to.have.lengthOf(1)
            const [ scriptB ] = matches!
            expect(scriptA).to.not.equal(scriptB)
        }
    })

    test("Components in a subfolder can be dynamically imported", async () => {
        const C = await server.fetch("/C")
        expect(C).to.include("Contents of C")
        expect(C).to.include("background-color:burlywood")
        const [ src ] = devScriptRegex.exec(C)!
        const js = await server.fetch(src)
        expect(js).to.include("script of C")
    })

    test("Props can be sent to the component", async () => {
        const D = await server.fetch("/D")
        expect(D).to.include("0</div>")
        expect(D).to.include("1</div>")
        expect(D).to.include("2</div>")
        expect(D).to.include("3</div>")
        expect(D).to.include("4</div>")
    })
})
