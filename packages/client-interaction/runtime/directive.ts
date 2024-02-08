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

export default (async (load, opts) => {
    await firstInteraction
    const hy = async () => {
        const hydrate = await load()
        await hydrate()
    }
    if (opts.value === 'idle') {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(hy)
            return
        }
        setTimeout(hy, 100)
        return
    }
    hy()
}) satisfies import('astro').ClientDirective
