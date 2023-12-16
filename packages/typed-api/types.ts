import type { TypedHandler } from "./runtime/server.ts"

export type CreateRouter<Routes extends [string, unknown][]> =
    _CreateRouter<Routes, {}>

type _CreateRouter<Routes extends [string, unknown][], Router> =
    Routes extends [] ? Router
    : Routes extends [infer Head, ...infer Tail extends [string, unknown][]]
        ? Head extends [infer Filename extends string, infer EndpointModule]
            ? _CreateRouter<Tail, DeepMerge<Router, Route<Filename, EndpointModule>>>
            : never
        : Router

type Route<Endpoint extends string, EndpointModule> =
    EndpointToObject<Endpoint, ClientProxy<EndpointModule>>

type ClientProxy<EndpointModule> = {
    [Method in keyof EndpointModule]:
        EndpointModule[Method] extends TypedHandler<infer Input, infer Output>
        ? { fetch(input: Input): Promise<Output> }
        : never
}

type EndpointToObject<Endpoint extends string, Handler> =
    Endpoint extends `${infer Start}/${infer Rest}`
        ? { [_ in Start]: EndpointToObject<Rest, Handler> }
        : { [_ in Endpoint]: Handler }

type DeepMerge<A, B> = {
    [Key in keyof A | keyof B]:
        Key extends keyof A
            ? Key extends keyof B
                ? DeepMerge<A[Key], B[Key]>
                : A[Key]
            : Key extends keyof B
                ? B[Key]
                : never
}
