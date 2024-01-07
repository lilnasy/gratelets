This library allows you to render astro components as a string in any project.

## Installation

```bash
npm install astro-carton
```

Note that only npm is supported.

## Usage

```js
// example.mjs
import { AstroCarton } from 'astro-carton/runtime'
import Component from './Component.astro'

const carton = new AstroCarton()
console.log(await carton.renderToString(Component))
```

```
node --import astro-carton ./example.mjs
```
