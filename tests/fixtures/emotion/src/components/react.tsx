import { useState } from "react"
import { css, injectGlobal } from "astro:emotion"

injectGlobal`body { margin: 0 }`

export default function Counter({
    children = [],
    count: initialCount = 0,
}) {
    const [count, setCount] = useState(initialCount);
    const add = () => setCount(x => x + 1);
    const subtract = () => setCount(x => x - 1);

    return (
        <>
            <div id="counter" className={css`
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
            <div className={css`text-align: center;`}>{children}</div>
        </>
    )
}