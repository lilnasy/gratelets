---
"astro-node-websocket": minor
---

Introduces a helper to determine whether the current request can be upgraded to a WebSocket connection. You can now read the `isUpgradeRequest` property from the `locals` object to decide how to handle the request.

```ts
export const GET: APIRoute = ctx => {
    if (ctx.locals.isUpgradeRequest) {
        const { response, socket } = ctx.locals.upgradeWebSocket()
        ...
    }
    ...
}
```
