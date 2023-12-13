/** @jsxImportSource solid-js */
import { createSignal } from "solid-js"
import stylex from '@stylexjs/stylex'

const styles = stylex.create({
    namesAreHard: {
        display: "grid",
        fontSize: "2em",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        marginTop: "2em",
        placeItems: "center",
    },
    namesAreHard2ElectricBoogaloo: {
        textAlign: "center"
    }
})

export default function Counter({ children = [], count: initialCount = 0 }) {
    const [count, setCount] = createSignal(initialCount);
    const add = () => setCount(count() + 1);
    const subtract = () => setCount(count() - 1);

    return (
        <>
            <div id="counter" {...stylex.props(styles.namesAreHard)}>
                <button onClick={subtract}>-</button>
                <pre>{count()}</pre>
                <button onClick={add}>+</button>
            </div>
            <div {...stylex.props(styles.namesAreHard2ElectricBoogaloo)}>{children}</div>
        </>
    )
}
