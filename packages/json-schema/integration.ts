import fs from "node:fs"
import { fileURLToPath } from "node:url"
import { createServer} from "vite"
import {
	createContentTypesGenerator,
	createNodeLogger,
	createVite,
	createSettings,
	globalContentConfigObserver,
	resolveConfig,
	type ContentConfig
} from "./utils.ts"
import { zodToJsonSchema } from "zod-to-json-schema"
import type { AstroIntegration } from "astro"

export interface Options {}

export default function(_?: Partial<Options>): AstroIntegration {
    return {
        name: "astro-integration-json-schema",
        hooks: {
            async "astro:config:setup" ({ config }) {
                const { collections } = await getCollectionDefinitions()
				for (const key in collections) {
					const collection = collections[key]
					if (collection.type !== "data") continue
					const schema = zodToJsonSchema(collection.schema)
					const json = JSON.stringify(schema, null, 4)
					fs.writeFileSync(new URL(`./.astro/${key}.schema.json`, config.root), json)
				}
            }
        }
    }
}

async function getCollectionDefinitions(): Promise<ContentConfig> {
    const logger = createNodeLogger({ logLevel: "silent" })
	const { astroConfig } = await resolveConfig({}, "sync")

	const settings = await createSettings(astroConfig, fileURLToPath(astroConfig.root))

	const tempViteServer = await createServer(
		await createVite(
			{
				server: { middlewareMode: true, hmr: false, watch: { ignored: ["**"] } },
				optimizeDeps: { disabled: true },
				ssr: { external: [] },
				logLevel: "silent",
			},
			{ settings, logger, mode: "build", command: "build", fs }
		)
	)
	try {
		const contentTypesGenerator = await createContentTypesGenerator({
			contentConfigObserver: globalContentConfigObserver,
			logger: logger,
			fs,
			settings,
			viteServer: tempViteServer,
		})
		
        await contentTypesGenerator.init()

		const contentConfig = globalContentConfigObserver.get()
		if (contentConfig.status === "loaded") {
			return contentConfig.config
		}
        else throw new Error("Could not load content/config.ts", { cause: contentConfig })
	} catch (e) {
		console.error(e)
	} finally {
		await tempViteServer.close()
	}
}