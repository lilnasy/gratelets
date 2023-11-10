import Astro from 'astro:global';

export default function ({ children }) {
    return <p>You are at {Astro.url.pathname}</p>;
}
