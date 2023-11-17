import { describe, beforeAll, test, expect } from "vitest"
import { build, fileExists, testAdapter } from "./utils.ts"
import prerenderPatterns from "../integration.ts"
import type { SSRManifest } from "astro"

describe("with server output", () => {
    let manifest: SSRManifest
    const currentDecisions: Record<string, "prerender" | "render on demand"> = {}
    
    beforeAll(async () => {
        await build("./fixtures/prerender-patterns", {
            output: "server",
            adapter: testAdapter(),
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
                            entryPoint: "./src/not-pages/added-by-integration.astro",
                            pattern: "/added-by-integration"
                        })
                    }
                }
            } ]
        })
        const entrypoint = "./fixtures/prerender-patterns/dist/server/entry.mjs?1"
        const exports = await import(entrypoint)
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
            fileExists("./fixtures/prerender-patterns/dist/client/page-default/index.html")
        ).to.equal(true)
        
        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/pages/page-default.astro")!()
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })
    
    test("page: prerender -> rendered on demand", async () => {
        // static file is not created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/page-set-to-prerender/index.html")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/page-set-to-prerender.astro")!()
        const { default: factory } = await page()
        expect(factory).not.to.deep.include({ name: "noop" })
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
    
    test("page: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/page-set-to-render-on-demand/index.html")
        ).to.equal(true)
        
        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/pages/page-set-to-render-on-demand.astro")!()
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })
    
    test("endpoint: unspecified -> prerendered", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/endpoint-default")
        ).to.equal(true)
        
        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-default.ts")!()
        // @ts-ignore
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })
    
    test("endpoint: prerendered -> rendered on demand", async () => {
        // static file is not created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/endpoint-set-to-prerender")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-set-to-prerender.ts")!()
        // @ts-ignore
        const { GET } = await page()
        expect(GET).not.to.deep.include({ name: "noop" })
        const response = GET({ request: { url: "" } })
        expect(response).to.be.an.instanceof(Response)
    })
    
    test("endpoint: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/endpoint-set-to-render-on-demand")
        ).to.equal(true)
        
        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-set-to-render-on-demand.ts")!()
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })

    test("injected page: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/added-by-integration/index.html")
        ).to.equal(true)

        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/not-pages/added-by-integration.astro")!()
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })
})

describe("hybrid output", () => {
    let manifest: SSRManifest
    const currentDecisions: Record<string, "prerender" | "render on demand"> = {}
    
    beforeAll(async () => {
        await build("./fixtures/prerender-patterns", {
            output: "hybrid",
            adapter: testAdapter(),
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
                            entryPoint: "./src/not-pages/added-by-integration.astro",
                            pattern: "/added-by-integration"
                        })
                    }
                }
            } ]
        })
        const entrypoint = "./fixtures/prerender-patterns/dist/server/entry.mjs?2"
        const exports = await import(entrypoint)
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
            fileExists("./fixtures/prerender-patterns/dist/client/page-default/index.html")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/page-default.astro")!()
        const { default: factory } = await page()
        expect(factory).not.to.deep.include({ name: "noop" })
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
    
    test("page: prerender -> rendered on demand", async () => {
        // static file is not created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/page-set-to-prerender/index.html")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/page-set-to-prerender.astro")!()
        const { default: factory } = await page()
        expect(factory).not.to.deep.include({ name: "noop" })
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
    
    test("page: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/page-set-to-render-on-demand/index.html")
        ).to.equal(true)
        
        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/pages/page-set-to-render-on-demand.astro")!()
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })
    
    test("endpoint: unspecified -> rendered on demand", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/endpoint-default")
        ).to.equal(false)
        
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-default.ts")!()
        // @ts-ignore
        const { GET } = await page()
        expect(GET).not.to.deep.include({ name: "noop" })
        const response = GET({ request: { url: "" } })
        expect(response).to.be.an.instanceof(Response)
    })
    
    test("endpoint: prerender -> rendered on demand", async () => {
        // static file is not created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/endpoint-set-to-prerender")
        ).to.equal(false)
    
        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-set-to-prerender.ts")!()
        // @ts-ignore
        const { GET } = await page()
        expect(GET).not.to.deep.include({ name: "noop" })
        const response = GET({ request: { url: "" } })
        expect(response).to.be.an.instanceof(Response)
    })
    
    test("endpoint: render on demand -> prerendered", async () => {
        // static file is created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/endpoint-set-to-render-on-demand")
        ).to.equal(true)
        
        // ssr chunk exports noop
        const { page } = await manifest.pageMap!.get("src/pages/endpoint-set-to-render-on-demand.ts")!()
        // @ts-ignore
        const module = await page()
        expect(module).to.deep.include({ name: "noop" })
        expect(module.toString()).to.equal("() => {}")
    })

    test("injected page: prerendered -> render on demand", async () => {
        // static file is not created
        expect(
            fileExists("./fixtures/prerender-patterns/dist/client/added-by-integration/index.html")
        ).to.equal(false)

        // ssr chunk is functional
        const { page } = await manifest.pageMap!.get("src/not-pages/added-by-integration.astro")!()
        const { default: factory } = await page()
        expect(factory).not.to.deep.include({ name: "noop" })
        expect(factory).to.deep.include({ isAstroComponentFactory: true })
    })
})
