<script lang="ts">
    import { css, injectGlobal } from "astro:emotion"
    
    injectGlobal`body { margin: 0 }`

    let count = 0
    const add = () => count++
    const subtract = () => count--
</script>

<div id="counter" class={css`
    display: grid;
    font-size: 2em;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 3em;
    place-items: center;
`}>
    <button on:click={subtract}>-</button>
    <pre>{count}</pre>
    <button on:click={add}>+</button>
</div>
<div class={css`text-align: center;`}>
    <slot />
</div>
