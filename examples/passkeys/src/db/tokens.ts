// acts as the authority that can generate temporary tokens
// regenerated at server start because its a demo
const privateKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
)

export async function create(username: string, expires: Date): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const concatenated = new TextEncoder().encode(username + '/' + Number(expires))
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, privateKey, concatenated)
    const encoded = btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)))
    console.log("created encoded", encoded)
    return encoded
}

export async function read(encoded: string) {
    console.log("reading encoded", encoded)
    const decoded = new Uint8Array(atob(encoded).split('').map(char => char.charCodeAt(0)))
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decoded.slice(0, 12) }, privateKey, decoded.slice(12))
    const [username, expires] = new TextDecoder().decode(decrypted).split('/')
    return { username, expires: new Date(Number(expires)) }
}
