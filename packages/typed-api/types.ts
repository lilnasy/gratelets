import type { TypedAPIHandler } from "./runtime/server.ts"

/***** ROUTER *****/

export type CreateRouter<Routes extends [string, unknown][]> =
    CreateRouter_<Routes, {}>

type CreateRouter_<Routes extends [string, unknown][], Router> =
    Routes extends [infer Head, ...infer Tail extends [string, unknown][]]
        ? Head extends [infer Filename extends string, infer EndpointModule]
            ? CreateRouter_<Tail, DeepMerge<Router, Route<Filename, EndpointModule>>>
            : never
        : Router

type Route<Endpoint extends string, EndpointModule> =
    EndpointToObject<Endpoint, ModuleProxy<EndpointModule, never>>

type ModuleProxy<EndpointModule, Params extends string> = {
    [Method in keyof EndpointModule]:
        Method extends string
            ? Method extends Uppercase<Method>
                ? MethodProxy<EndpointModule[Method], Params, Method extends string ? Method : never>
            : TypedAPITypeError<"The method of an API Route must be exported as uppercase.">
        : TypedAPITypeError<"The method of an API Route must be exported as uppercase.">
}

type MethodProxy<MethodExport, Params extends string, Method extends string> =
    MethodExport extends TypedAPIHandler<infer Input, infer Output>
        ? Fetch_<Input, Output, Params, Method>
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

type RequireParam<MP, Param extends string> = 
    MP extends ModuleProxy<infer EP, infer Params>
        ? ModuleProxy<EP, MapString<Params, never> | Param>
        : TypedAPITypeError<"Types for this route with params could not be generated. This is probably a bug. Please open an issue with the minimal reproduction steps.">

/***** FETCH FUNCTION *****/

// when the path includes a param (pages/api/[x].ts -> client.api._x.GET)
// typed API options should become required
export type Fetch_<Input, Output, Params extends string, Method extends string> = 
    IsNever<Params> extends true
        ? Method extends "ALL" ? FetchM<Input, Output> : unknown extends Input ? FetchO<Input, Output> : Fetch<Input, Output>
        : Method extends "ALL" ? FetchMP<Input, Output, Params> : FetchP<Input, Output, Params>

interface Fetch<Input, Output> {
    fetch(input: Input, options?: Options): Promise<Output>
}

interface FetchO<Input, Output> {
    fetch(input?: Input, options?: Options): Promise<Output>
}

interface FetchM<Input, Output> {
    fetch(input: Input, options: OptionsM): Promise<Output>
}

interface FetchP<Input, Output, Params extends string> {
    fetch(input: Input, options: OptionsP<Params>): Promise<Output>
}

interface FetchMP<Input, Output, Params extends string> {
    fetch(input: Input, options: OptionsMP<Params>): Promise<Output>
}

interface Options extends Omit<RequestInit, "body" | "method"> {}

interface OptionsM extends Options, Required<Pick<RequestInit, "method">> {}

interface OptionsP<Params extends string> extends Options {
    params: Record<Params, string>
}

interface OptionsMP<Params extends string> extends OptionsM, OptionsP<Params> {}

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
