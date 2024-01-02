import { defineApiRoute } from "astro-typed-api/server"
import * as User from "db/users.ts"

export const POST = defineApiRoute({
    fetch(username: string, { url }) {
        const userDetails = User.read({ username })
    
        if (userDetails === User.InvalidUsername) {
            return { error: "invalid username" } as const
        }
        /* its going to be a fresh registration */
        if (userDetails === User.NotFound) {
            const challenge = crypto.getRandomValues(new Uint8Array(32))
            const userDetails = User.create({ username, pendingChallenge: challenge }) as User.Details
            
            return {
                type: "create",
                rp: {
                    name: "Readable Relying Party Name",
                    id: import.meta.env.RELYING_PARTY_ID ?? url.hostname
                },
                /**
                 * An ArrayBuffer, TypedArray, or DataView provided by the relying
                 * party's server and used as a cryptographic challenge. This value
                 * will be signed by the authenticator and the signature will be sent
                 * back as part of AuthenticatorAttestationResponse.attestationObject.
                 */
                challenge,
                user: {
                    id: userDetails.id,
                    name: userDetails.username,
                    displayName: userDetails.displayName
                },
                /**
                 * An Array of objects which specify the key types and signature
                 * algorithms the Relying Party supports, ordered from most
                 * preferred to least preferred. The client and authenticator
                 * will make a best-effort to create a credential of the most
                 * preferred type possible.
                 * 
                 * alg: A number that is equal to a [COSE Algorithm Identifier]
                 * (https://www.iana.org/assignments/cose/cose.xhtml#algorithms)
                 * representing the cryptographic algorithm to use for this
                 * credential type. It is recommended that relying parties that
                 * wish to support a wide range of authenticators should include
                 * at least the following values in the provided choices:
                 */
                pubKeyCredParams: [
                    /**
                     * Known in COSE as ES256
                     * Known in Subtle Crypto as "ECDSA"
                     */
                    // { alg: -7, type: 'public-key' },
                    /**
                     * Known in COSE as EdDSA
                     * Known in (server-only) Subtle Crypto as "Ed25519"
                     */
                    // { alg: -8, type: 'public-key' },
                    /**
                     * Known in COSE as RS256
                     * Known in Subtle Crypto as "RSASSA-PKCS1-v1_5"
                     */
                    { alg: -257, type: 'public-key' }
                ],
                timeout: 60000,
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    requireResidentKey: true
                },
                attestation: "none"
            } as const satisfies PublicKeyCredentialCreationOptions & { type: "create" }
        }
        /* registration request exists but wasn't followed up on */ 
        if (typeof userDetails === "object" && userDetails.credentials.length === 0) {
            // starting over - we delete the partial entry and create a new challenge to associate with the username
            User.delete({ username })
            const challenge = crypto.getRandomValues(new Uint8Array(32))
            const userDetails = User.create({ username, pendingChallenge: challenge }) as User.Details
            return {
                type: "create",
                rp: {
                    name: "Readable Relying Party Name",
                    id: import.meta.env.RELYING_PARTY_ID ?? url.hostname
                },
                challenge,
                user: {
                    id: userDetails.id,
                    name: userDetails.username,
                    displayName: userDetails.displayName
                },
                pubKeyCredParams: [
                    { alg: -257, type: 'public-key' }
                ],
                timeout: 60000,
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    requireResidentKey: true
                },
                attestation: "none"
            } as const satisfies PublicKeyCredentialCreationOptions & { type: "create" }
        }
        
        /* login request */
        const challenge = crypto.getRandomValues(new Uint8Array(32))
        const { credentials } = User.update({ username, pendingChallenge: challenge }) as User.Details
        const registeredCredentials = credentials.map(cred => cred.descriptor)

        return {
            type: "get",
            allowCredentials: registeredCredentials,
            challenge
        } as const satisfies PublicKeyCredentialRequestOptions & { type: "get" }
    }
})
