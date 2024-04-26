import { defineApiRoute } from "astro-typed-api/server"
import * as User from "db/users.ts"
import * as Token from "db/tokens.ts"

interface LoginRequest {
    username: string
    response: Pick<AuthenticatorAssertionResponse, "clientDataJSON" | "authenticatorData" | "signature">
}

export const POST = defineApiRoute({
    async fetch(loginRequest: LoginRequest, { cookies }) {
        const userDetails = User.read(loginRequest)
    
        if (userDetails === User.InvalidUsername) return { error: "invalid username" } as const
        else if (userDetails === User.NotFound) return { error: "user not found" } as const
    
        const { pendingChallenge, credentials } = userDetails
        if (pendingChallenge === undefined) return { error: "no challenge pending" } as const
    
        const clientDataHash = await crypto.subtle.digest("SHA-256", loginRequest.response.clientDataJSON)
        const { key } = credentials[0]
        const verified = await crypto.subtle.verify(
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            key,
            loginRequest.response.signature,
            Uint8Array.of(...new Uint8Array(loginRequest.response.authenticatorData), ...new Uint8Array(clientDataHash))
        )
    
        if (!verified) return { error: "invalid signature" } as const
        
        User.update({
            username: loginRequest.username,
            data: {
                loginCount: userDetails.data.loginCount + 1,
                lastLogin: new Date()
            }
        })
    
        const expires = new Date(Date.now() + 1000 * 60 * 60)
        const token = await Token.create(loginRequest.username, expires)
    
        cookies.set("Token", token, { expires, path: "/" })
    
        return { success: loginRequest.username } as const
    }
})