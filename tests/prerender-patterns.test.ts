import { describe, beforeAll, test, expect } from "vitest"
import { build, type BuildFixture, testAdapter } from "./utils.ts"
import prerenderPatterns from "../packages/prerender-patterns/integration.ts"
import type { SSRManifest } from "astro"

describe("with server output", () => {
    let manifest: SSRManifest
    let fixture: BuildFixture
    const currentDecisions: Record<string, "prerender" | "render on demand"> = {}
    
    beforeAll(async () => {
        fixture = await build("./fixtures/prerender-patterns", {
            output: "server",
            adapter: testAdapter,
            integrations: [ prerenderPatterns((path, currentDecision) => {
                currentDecisions[path] = currentDecision
                if (path === "src/pages/page-default.astro") return "prerender"
                if (path === "src/pages/endpoint-default.ts") return "prerender"
                if (path === "src/pages/page-set-to-prerender.astro") return "render on demand"
                if (path === "src/pages/endpoint-set-to-prerender.ts") return "render on demand"
                if (path === "src/pages/page-set-to-render-on-demand.astro") return "prerender"
                if (path === "src/pages/endpoint-set-to-render-on-demand.ts") return "prerender"
                if (path === "src/not-pages/added-by-integration.astro") return "prerender"
            }), {
                name: "test-inject-route",
                hooks: {
                    "astro:config:setup" ({ injectRoute }) {
                        injectRoute({
                            entrypoint: "./src/not-pages/added-by-integration.astro",
                            pattern: "/added-by-integration"
                        })
                    }
                }
            } ]
        })
        const exports = await import(fixture.serverEntry)
        manifest = exports.manifest
    })
    
    test("provides the current decision to the callback", () => {
        expect(currentDecisions).to.deep.include({
            "src/pages/404.astro"                          : "render on demand",
            "src/pages/500.astro"                          : "render on demand",
            "src/pages/endpoint-default.ts"                : "render on demand",
            "src/pages/endpoint-set-to-prerender.ts"       : "prerender",
            "src/pages/endpoint-set-to-render-on-demand.ts": "render on demand",
            "src/pages/page-default.astro"                 : "render on demand",
            "src/pages/page-set-to-prerender.astro"        : "prerender",
            "src/pages/page-set-to-render-on-demand.astro" : "render on demand",
            "src/not-pages/added-by-integration.astro"     : "render on demand",
        })
    })
    
    test("page: unspecified -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/page-default/index.html")
        ).to.equal(true)
        
        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/pages/page-default.astro")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })
    
    test("page: prerender -> rendered on demand", async () => {
        // static file is not created
        expect(
            fixture.fileExists("client/page-set-to-prerender/index.html")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/page-set-to-prerender.astro")!()
        const { default: factory } = await page()
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
    
    test("page: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/page-set-to-render-on-demand/index.html")
        ).to.equal(true)
        
        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/pages/page-set-to-render-on-demand.astro")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })
    
    test("endpoint: unspecified -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/endpoint-default")
        ).to.equal(true)
        
        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/pages/endpoint-default.ts")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })
    
    test("endpoint: prerendered -> rendered on demand", async () => {
        // static file is not created
        expect(
            fixture.fileExists("client/endpoint-set-to-prerender")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-set-to-prerender.ts")!()
        // @ts-ignore
        const { GET } = await page()
        const response = GET({ request: { url: "" } })
        expect(response).to.be.an.instanceof(Response)
    })
    
    test("endpoint: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/endpoint-set-to-render-on-demand")
        ).to.equal(true)
        
        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/pages/endpoint-set-to-render-on-demand.ts")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })

    test("injected page: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/added-by-integration/index.html")
        ).to.equal(true)

        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/not-pages/added-by-integration.astro")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })
})

describe("static output", () => {
    let manifest: SSRManifest
    let fixture: BuildFixture
    const currentDecisions: Record<string, "prerender" | "render on demand"> = {}
    
    beforeAll(async () => {
        fixture = await build("./fixtures/prerender-patterns", {
            output: "static",
            adapter: testAdapter,
            integrations: [ prerenderPatterns((path, currentDecision) => {
                currentDecisions[path] = currentDecision
                if (path === "src/pages/page-default.astro") return "render on demand"
                if (path === "src/pages/endpoint-default.ts") return "render on demand"
                if (path === "src/pages/page-set-to-prerender.astro") return "render on demand"
                if (path === "src/pages/endpoint-set-to-prerender.ts") return "render on demand"
                if (path === "src/pages/page-set-to-render-on-demand.astro") return "prerender"
                if (path === "src/pages/endpoint-set-to-render-on-demand.ts") return "prerender"
                if (path === "src/not-pages/added-by-integration.astro") return "render on demand"
            }), {
                name: "test-inject-route",
                hooks: {
                    "astro:config:setup" ({ injectRoute }) {
                        injectRoute({
                            entrypoint: "./src/not-pages/added-by-integration.astro",
                            pattern: "/added-by-integration"
                        })
                    }
                }
            } ]
        })
        const exports = await import(fixture.serverEntry)
        manifest = exports.manifest
    })
    
    test("provides the current decision to the callback", () => {
        expect(currentDecisions).to.deep.include({
            "src/pages/404.astro"                          : "prerender",
            "src/pages/500.astro"                          : "prerender",
            "src/pages/endpoint-default.ts"                : "prerender",
            "src/pages/endpoint-set-to-prerender.ts"       : "prerender",
            "src/pages/endpoint-set-to-render-on-demand.ts": "render on demand",
            "src/pages/page-default.astro"                 : "prerender",
            "src/pages/page-set-to-prerender.astro"        : "prerender",
            "src/pages/page-set-to-render-on-demand.astro" : "render on demand",
            "src/not-pages/added-by-integration.astro"     : "prerender",
        })
    })
    
    test("page: unspecified -> rendered on demand", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/page-default/index.html")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/page-default.astro")!()
        const { default: factory } = await page()
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
    
    test("page: prerender -> rendered on demand", async () => {
        // static file is not created
        expect(
            fixture.fileExists("client/page-set-to-prerender/index.html")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/page-set-to-prerender.astro")!()
        const { default: factory } = await page()
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
    
    test("page: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/page-set-to-render-on-demand/index.html")
        ).to.equal(true)
        
        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/pages/page-set-to-render-on-demand.astro")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })
    
    test("endpoint: unspecified -> rendered on demand", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/endpoint-default")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-default.ts")!()
        // @ts-ignore
        const { GET } = await page()
        const response = GET({ request: { url: "" } })
        expect(response).to.be.an.instanceof(Response)
    })
    
    test("endpoint: prerender -> rendered on demand", async () => {
        // static file is not created
        expect(
            fixture.fileExists("client/endpoint-set-to-prerender")
        ).to.equal(false)
    
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-set-to-prerender.ts")!()
        // @ts-ignore
        const { GET } = await page()
        const response = GET({ request: { url: "" } })
        expect(response).to.be.an.instanceof(Response)
    })
    
    test("endpoint: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fixture.fileExists("client/endpoint-set-to-render-on-demand")
        ).to.equal(true)
        
        // check that ssr chunk exports an empty module
        const compiledPage = await manifest.pageMap!.get("src/pages/endpoint-set-to-render-on-demand.ts")!()
        expect(Object.keys(compiledPage)).toStrictEqual([])
    })

    test("injected page: prerendered -> render on demand", async () => {
        // static file is not created
        expect(
            fixture.fileExists("client/added-by-integration/index.html")
        ).to.equal(false)

        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/not-pages/added-by-integration.astro")!()
        const { default: factory } = await page()
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
})
