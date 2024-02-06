import { useState } from "preact/hooks"

export default function Counter() {
	const [count, setCount] = useState(0);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);

	return (
		<>
			<div class="counter">
				<button onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button onClick={add}>+</button>
			</div>
			<div id="counter-message">{import.meta.env.SSR ? "server rendered" : "hydrated"}</div>
		</>
	);
}
