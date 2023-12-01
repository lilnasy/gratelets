/** @jsxImportSource solid-js */
import { createSignal } from "solid-js"
import { css, injectGlobal } from "astro:emotion"

injectGlobal`body { margin: 0 }`

export default function Counter({ children = [], count: initialCount = 0 }) {
    const [count, setCount] = createSignal(initialCount);
    const add = () => setCount(count() + 1);
    const subtract = () => setCount(count() - 1);

    return (
        <>
            <div id="counter" class={css`
                display: grid;
                font-size: 2em;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                margin-top: 3em;
                place-items: center;
            `}>
                <button onClick={subtract}>-</button>
                <pre>{count()}</pre>
                <button onClick={add}>+</button>
            </div>
            <div class={css`text-align: center;`}>{children}</div>
        </>
    )
}
