import { defineApiRoute } from "astro-typed-api/server"
import * as User from "db/users.ts"
import * as Token from "db/tokens.ts"

interface Registration {
    username: string
    credential: {
        rawId: BufferSource
        key: ArrayBuffer
        transports?: AuthenticatorTransport[]
        algorithm: number
        type: "public-key"
    }
}

export const POST = defineApiRoute({
    async fetch(user: Registration, { cookies }) {
        const readResult = User.read(user)
        
        if (readResult === User.InvalidUsername) return { error: "invalid username" } as const
        else if (readResult === User.NotFound || readResult.credentials.length === 0) { /* fallthrough */ }
        else return { error: "user already exists" } as const
        
        const key = await crypto.subtle.importKey(
            "spki",
            user.credential.key,
            user.credential.algorithm === -257 ? { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } : "unsupported",
            true,
            ["verify"]
        )

        const descriptor : PublicKeyCredentialDescriptor = {
            id: user.credential.rawId,
            transports: user.credential.transports,
            type: user.credential.type
        }

        const userDetails = {
            username: user.username,
            credentials: [{ key, descriptor }],
        }

        if (readResult === User.NotFound) User.create(userDetails)
        else User.update(userDetails)

        // the user will remain logged in for 1 hour
        const expires = new Date(Date.now() + 1000 * 60 * 60)
        const token = await Token.create(user.username, expires)
        cookies.set("Token", token, { expires, path: "/" })
        
        return { success: user.username } as const
    }
})