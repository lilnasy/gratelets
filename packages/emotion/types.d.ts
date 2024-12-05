declare module "astro:emotion" {
    export const css: (template: TemplateStringsArray) => string
    export const injectGlobal: (template: TemplateStringsArray) => void
}
