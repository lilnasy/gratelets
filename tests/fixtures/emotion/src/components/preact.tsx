/** @jsxImportSource preact */
import { signal } from "@preact/signals"
import { css, injectGlobal } from "astro:emotion"

injectGlobal`body { margin: 0 }`

export default function Counter({ children = [], count = signal(0) }) {
    const add = () => count.value++
    const subtract = () => count.value--

    return (
        <>
            <div id="counter" class={css`
                display: grid;
                font-size: 2em;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                margin-top: 2em;
                place-items: center;
            `}>
                <button onClick={subtract}>-</button>
                <pre>{count}</pre>
                <button onClick={add}>+</button>
            </div>
            <div class={css`text-align: center;`}>{children}</div>
        </>
    )
}
