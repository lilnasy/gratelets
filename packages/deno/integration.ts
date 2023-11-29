import { passthroughImageService } from "astro/config"
import type { AstroAdapter, AstroConfig, AstroIntegration } from "astro"

// REF: https://github.com/denoland/deno/tree/main/ext/node/polyfills
const COMPATIBLE_NODE_MODULES = [
	"assert", "async_hooks",
	"buffer",
	"child_process", "cluster", "console", "constants", "crypto",
	"dgram", "diagnostics_channel", "dns",
	"events",
	"fs",
	"http", "http2", "https",
	"inspector",
	"module",
	"net",
	"os",
	"path", "perf_hooks", "process", "punycode",
	"querystring",
	"readline", "repl",
	"stream", "string_decoder", "sys",
	"timers", /* "tls", */ "trace_events", "tty",
	"url", "util",
	/* "v8", "vm", */
	/* "wasi", "webcrypto", */ "worker_threads",
	"zlib",
]

const external = [...COMPATIBLE_NODE_MODULES, ...COMPATIBLE_NODE_MODULES.map((m) => `node:${m}`)]

export interface Options {
	port?: number
	hostname?: string
}
// Allow the user to create a type where all keys are optional.
// Useful for functions where props are merged.
export type DeepPartial<T> = {
	[Key in keyof T]?: T[Key] extends infer Value
		? Value extends (infer U)[] ? DeepPartial<U>[]
		: Value extends URL ? Value
		: Value extends Function ? Value
		: Value extends {} ? DeepPartial<Value>
		: Value
		: never;
};

export default function createIntegration(options?: Options): AstroIntegration {
	return {
		name: "astro-deno",
		hooks: {
            "astro:config:setup" ({ updateConfig, config }) {
                // https://github.com/denoland/deno-astro-adapter/pull/7
                if (
					config.image.service.entrypoint === 'astro/assets/services/sharp' ||
					config.image.service.entrypoint === 'astro/assets/services/squoosh'
				) updateConfig({ image: { service: passthroughImageService() } } satisfies DeepPartial<AstroConfig>)
            },
			"astro:config:done" ({ setAdapter }) {
				setAdapter(getAdapter(options))
			},
			"astro:build:setup" ({ target, vite }) {
				if (target === "server") {
					vite.ssr!.noExternal = true
					const rollupOptions = vite.build!.rollupOptions!
					const rollupExternal = rollupOptions.external
					if (Array.isArray(rollupExternal)) rollupExternal.push(...external)
					else if (rollupExternal === undefined) rollupOptions.external = external
				}
			}
		}
	}
}

export function getAdapter(options?: Options): AstroAdapter {
	return {
		name: "astro-deno",
		serverEntrypoint: "astro-deno/runtime/server.ts",
		args: options ?? {},
		exports: ["handler", "start", "stop", "running"],
		supportedAstroFeatures: {
			hybridOutput: "stable",
			staticOutput: "stable",
			serverOutput: "stable",
			assets: {
				supportKind: "stable",
				isSharpCompatible: false,
				isSquooshCompatible: false,
			}
		}
	}
}
