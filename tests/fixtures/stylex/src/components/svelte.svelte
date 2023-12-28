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

    // styleX is designed for react, uses "className", the style prop's value is an object
    // source: https://github.com/nmn/sveltekit-stylex/blob/b8be20a/src/styles/utils.ts
    const attrs = ({
        className,
        style
    }: Readonly<{
        className?: string | undefined;
        style?: { [key: string]: string | number };
    }>) => {
        const result: { class?: string; style?: string } = {};
        if (className != null) {
            result.class = className
        }
        if (style != null) {
            result.style = Object.entries(style)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ')
        }
        return result
    }
</script>
<script lang="ts">
    let count = 0
    const add = () => count++
    const subtract = () => count--
</script>

<div id="counter" {...attrs(stylex.props(styles.namesAreHard))}>
    <button on:click={subtract}>-</button>
    <pre>{count}</pre>
    <button on:click={add}>+</button>
</div>
<div {...attrs(stylex.props(styles.namesAreHard2ElectricBoogaloo))}>
    <slot />
</div>
