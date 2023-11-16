import type { AstroIntegration } from "astro"

export const prerender = "prerender"
export const renderOnDemand = "render on demand"

type Directive =
    | typeof prerender
    | typeof renderOnDemand

interface Callback {
    (path: string, currentDecision: Directive): Deferrable<Nullable<Directive>>
}

export default function (callback?: Callback): AstroIntegration {
    return {
        name: "prerender-patterns",
        hooks: {
            "astro:config:setup" ({ logger }) {
                if (callback === undefined) {
                    logger.warn("No callback was provided. This integration will not do anything.")
                }
                else if (typeof callback !== "function") {
                    logger.error(`The argument to this integration must be a function, but ${typeof callback} was provided instead.`)
                }
            },
            async "astro:build:setup" ({ pages, target, logger }) {
                
                if (callback === undefined) return

                // Astro adds prerender flags after the server setup but before the client setup.
                // Setting it during the server setup has no effect, because astro would overwrite it.
                // Edge case: the client setup doesn't happen if there is no client-side javascript at all,
                // leaving no oppurtunity for this integration to work.
                if (target !== "client") return
                
                for (const [ relativePath, pageBuildData ] of pages) {
                    const current = pageBuildData.route.prerender
                    const override = await callback(relativePath, current ? prerender : renderOnDemand)

                    if (override === undefined || override === null) continue
                    
                    else if (override === prerender) {
                        if (current === true) logger.debug(`${relativePath} is already prerendered.`)
                        else {
                            pageBuildData.route.prerender = true
                            logger.debug(`${relativePath} will now be prerendered.`)
                        }
                    }
                    
                    else if (override === "render on demand") {
                        if (current === false) logger.debug(`${relativePath} is already being rendered on demand.`)
                        else {
                            pageBuildData.route.prerender = false
                            logger.debug(`${relativePath} will now be rendered on demand.`)
                        }
                    }
                    
                    else if (typeof override === "boolean") {
                        logger.error(`Directive for ${relativePath} is not recognised: ${override}. Did you mean to return ${override ? `"${prerender}"` : `"${renderOnDemand}"`} instead?`)
                    }
                    
                    else {
                        logger.error(`Directive for ${relativePath} is not recognised. This will have no effect. Please make sure the directive is either "${prerender}" or "${renderOnDemand}".`)
                        console.error("Provided directive:", override)
                    }
                }
            }
        }
    } satisfies AstroIntegration
}

type Deferrable<T> = T | Promise<T>
type Nullable<T> = T | undefined | null | void
