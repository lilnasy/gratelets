const firstInteraction = new Promise<void>(resolve => {
    const controller = new AbortController;
    for (const event of [ "keydown", "mousedown", "pointerdown", "touchstart" ]) {
        document.addEventListener(
            event,
            () => (resolve(), controller.abort()),
            { once: true, passive: true, signal: controller.signal }
        )
    }
})

export default (async load => {
    await firstInteraction
    const hydrate = await load()
    await hydrate()
}) satisfies import('astro').ClientDirective
