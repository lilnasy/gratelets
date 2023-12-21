import type { TypedAPIHandler } from "./runtime/server.ts"

export type CreateRouter<Routes extends [string, unknown][]> =
    CreateRouter_<Routes, {}>

type CreateRouter_<Routes extends [string, unknown][], Router> =
    Routes extends [infer Head, ...infer Tail extends [string, unknown][]]
        ? Head extends [infer Filename extends string, infer EndpointModule]
            ? CreateRouter_<Tail, DeepMerge<Router, Route<Filename, EndpointModule>>>
            : never
        : Router

type Route<Endpoint extends string, EndpointModule> =
    EndpointToObject<Endpoint, ModuleProxy<EndpointModule>>

type ModuleProxy<EndpointModule> = {
    [Method in keyof EndpointModule]: MethodProxy<EndpointModule[Method]>
}

type MethodProxy<MethodExport> =
    MethodExport extends TypedAPIHandler<infer Input, infer Output>
        ? Fetch_<Input, Output>
        : TypedAPITypeError<"This export from the API Route was not a typed handler. Please make sure it was created using `defineApiRoute`.">

type EndpointToObject<Endpoint extends string, ModuleProxy> =
    Endpoint extends `[...${infer Param}]`
        ? { [_ in `_${Param}_`]: RequireParam<ModuleProxy, Param> }
    : Endpoint extends `[${infer Param}]/${infer Rest}`
        ? { [_ in `_${Param}`]: EndpointToObject<Rest, RequireParam<ModuleProxy, Param>> }
    : Endpoint extends `[${infer Param}]`
        ? { [_ in `_${Param}`]: RequireParam<ModuleProxy, Param> }
    : Endpoint extends `${infer Start}/${infer Rest}`
        ? { [_ in Start]: EndpointToObject<Rest, ModuleProxy> }
        : { [_ in Endpoint]: ModuleProxy }

type RequireParam<ModuleProxy, Param extends string> = {
    [Method in keyof ModuleProxy]:
        ModuleProxy[Method] extends Fetch_<infer Input, infer Output, infer Params>
            ? Fetch_<Input, Output, MapString<Params, never> | Param>
            : TypedAPITypeError<"Types for this route with params could not be generated. This is probably a bug. Please open an issue with the minimal reproduction steps.">
}

/***** CLIENT TYPES *****/

// when the path includes a param (pages/api/[x].ts -> client.api._x.GET)
// typed API options should become required
export type Fetch_<Input, Output, Params extends string = never> = 
    IsNever<Params> extends true
        ? Fetch<Input, Output>
        : FetchP<Input, Output, Params>

interface Fetch<Input, Output> {
    fetch(input: Input, options?: Options_<never>): Promise<Output>
}

interface FetchP<Input, Output, Params extends string> {
    fetch(input: Input, options: Options_<Params>): Promise<Output>
}

// following the logic above, params within typed API options should become required
type Options_<Params extends string> =
    IsNever<Params> extends true
        ? Options
        : OptionsP<Params>

interface Options extends Omit<RequestInit, "method"> {}

interface OptionsP<Params extends string> extends Options {
    params: Record<Params, string>
}

/***** UTLITY FUNCTIONS *****/

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

export interface TypedAPITypeError<Message> {
    error: Message
}

export type MapAny<T, IfAny> = (T extends never ? true : false) extends false ? T : IfAny

type MapString<T, IfString> = T extends string ? string extends T ? IfString : T : T

type IsNever<T> = (T extends never ? true : false) extends true ? true : false  
