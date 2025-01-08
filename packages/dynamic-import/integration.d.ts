import type { AstroIntegration } from "astro";
/**
 * Not used, the integration does not have any configuration options
 */
interface Options {
}
/**
 * Adds the ability to dynamically import components,
 * including scripts and styles of only the picked components.
 */
export default function (_?: Options): AstroIntegration;
export {};
