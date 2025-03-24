declare module "emotion:extract" {
    export const css: (template: TemplateStringsArray) => string
    export const injectGlobal: (template: TemplateStringsArray) => void
}
