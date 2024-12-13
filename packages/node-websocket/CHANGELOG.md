# astro-node-websocket

## 1.1.0

### Minor Changes

- [#110](https://github.com/lilnasy/gratelets/pull/110) [`bf438fd`](https://github.com/lilnasy/gratelets/commit/bf438fd1fedae6c6be3b146dc8bc0480475605ae) Thanks [@lilnasy](https://github.com/lilnasy)! - Introduces a helper to determine whether the current request can be upgraded to a WebSocket connection. You can now read the `isUpgradeRequest` property from the `locals` object to decide how to handle the request.

  ```ts
  export const GET: APIRoute = ctx => {
      if (ctx.locals.isUpgradeRequest) {
          const { response, socket } = ctx.locals.upgradeWebSocket()
          ...
      }
      ...
  }
  ```

## 1.0.0

### Major Changes

- [#108](https://github.com/lilnasy/gratelets/pull/108) [`418ee0b`](https://github.com/lilnasy/gratelets/commit/418ee0baeeee0be4e721fb908cd998bdbaee8cac) Thanks [@lilnasy](https://github.com/lilnasy)! - Initial release
