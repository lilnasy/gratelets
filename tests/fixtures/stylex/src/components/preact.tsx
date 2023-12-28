/** @jsxImportSource preact */
import { signal } from "@preact/signals"
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

export default function Counter({ children = [], count = signal(0) }) {
    const add = () => count.value++
    const subtract = () => count.value--

    return (
        <>
            <div id="counter" {...stylex.props(styles.namesAreHard)}>
                <button onClick={subtract}>-</button>
                <pre>{count}</pre>
                <button onClick={add}>+</button>
            </div>
            <div {...stylex.props(styles.namesAreHard2ElectricBoogaloo)}>{children}</div>
        </>
    )
}
