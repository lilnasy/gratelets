<script context="module" lang="ts">
    import stylex from "@stylexjs/stylex"
    import { tokens } from "../tokens.stylex.ts"

    const styles = stylex.create({
        namesAreHard: {
            display: "grid",
            fontSize: "2em",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            marginTop: "2em",
            placeItems: "center",
            backgroundColor: tokens.background,
        },
        namesAreHard2ElectricBoogaloo: {
            textAlign: "center"
        }
    })
</script>
<script lang="ts">
    let count = 0
    const add = () => count++
    const subtract = () => count--
</script>

<div id="counter" {...stylex.attrs(styles.namesAreHard)}>
    <button on:click={subtract}>-</button>
    <pre>{count}</pre>
    <button on:click={add}>+</button>
</div>
<div {...stylex.attrs(styles.namesAreHard2ElectricBoogaloo)}>
    <slot />
</div>
