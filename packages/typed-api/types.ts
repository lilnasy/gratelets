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
        ? ClientFunctions<MethodExport, Input, Output, Params, Method>
        : TypedAPITypeError<"This export from the API Route is not a typed handler. Please make sure it is created using either `defineApiRoute` or `defineEndpoint`, which are exported by the module `\"astro-typed-api/server\"`.">

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


/***** CALLABLE FUNCTIONS *****/

export type ClientFunctions<
    MethodExport extends TypedAPIHandler<unknown, unknown>,
    Input,
    Output,
    Params extends string,
    Method extends string
> = 
    IsEmptyUnion<Params> extends true
        ? Method extends "ALL"
            ? 
                (MethodExport extends { fetch: unknown } ? Fetchable.RequiresMethod<Input, Output> : {}) &
                (MethodExport extends { subscribe: unknown }
                    // Input may not be used by the server side. For this case,
                    // Fetchable.InputOptional and Subscribable.InputOptional are
                    // the types not requiring any arguments.
                    // Fetchable.InputOptional is not used above because passing
                    // the method in arguments is still required. 
                    ? unknown extends Input
                        ? Subscribable.InputOptional<Input, Output>
                        : Subscribable<Input, Output>
                    : {}
                )
            : unknown extends Input
                ?
                    (MethodExport extends { fetch: unknown } ? Fetchable.InputOptional<Input, Output> : {}) &
                    (MethodExport extends { subscribe: unknown } ? MapGET<Method, Subscribable.InputOptional<Input, Output>> : {})
                :
                    (MethodExport extends { fetch: unknown } ? Fetchable<Input, Output> : {}) &
                    (MethodExport extends { subscribe: unknown } ? MapGET<Method, Subscribable<Input, Output>> : {})
        // When there is a dynamic segment in the path
        // (pages/api/[x].ts -> client.api._x.GET) the
        // options should become required and they must
        // have the params field.
        : Method extends "ALL"
            ?
                (MethodExport extends { fetch: unknown } ? Fetchable.RequiresMethodAndParams<Input, Output, Params> : {}) &
                (MethodExport extends { subscribe: unknown } ? Subscribable.RequiresParams<Input, Output, Params> : {})
            :
                (MethodExport extends { fetch: unknown } ? Fetchable.RequiresParams<Input, Output, Params> : {}) &
                (MethodExport extends { subscribe: unknown } ? MapGET<Method, Subscribable.RequiresParams<Input, Output, Params>> : {})


/***** FETCH FUNCTION *****/

interface Fetchable<Input, Output> {
    fetch(input: Input, options?: FetchOptions): Promise<Output>
}

namespace Fetchable {
    export interface InputOptional<Input, Output> {
        fetch(input?: Input, options?: FetchOptions): Promise<Output>
    }
    export interface RequiresMethod<Input, Output> {
        fetch(input: Input, options: FetchOptionsWithMethod): Promise<Output>
    }
    export interface RequiresParams<Input, Output, Params extends string> {
        fetch(input: Input, options: FetchOptionsWithParams<Params>): Promise<Output>
    }
    export interface RequiresMethodAndParams<Input, Output, Params extends string> {
        fetch(input: Input, options: FetchOptionsWithMethodAndParams<Params>): Promise<Output>
    }
}

interface FetchOptions extends Omit<RequestInit, "body" | "method"> {}

interface FetchOptionsWithMethod extends FetchOptions, Required<Pick<RequestInit, "method">> {}

interface FetchOptionsWithParams<Params extends string> extends FetchOptions {
    params: Record<Params, string>
}

interface FetchOptionsWithMethodAndParams<Params extends string>
    extends
        FetchOptionsWithMethod,
        FetchOptionsWithParams<Params> {}


/***** SUBSCRIBE FUNCTION *****/

interface Subscribable<Input, Output> {
    subscribe(input: Input, options?: SubscribeOptions): Promise<AsyncIterableIterator<Output>>
}

namespace Subscribable {
    export interface RequiresParams<Input, Output, Params extends string> {
        subscribe(input: Input, options: SubscribeOptionsWithParams<Params>): Promise<AsyncIterableIterator<Output>>
    }
    export interface InputOptional<Input, Output> {
        subscribe(input?: Input, options?: SubscribeOptions): Promise<AsyncIterableIterator<Output>>
    }
}

interface SubscribeOptions extends EventSourceInit {}

interface SubscribeOptionsWithParams<Params extends string> extends SubscribeOptions {
    params: Record<Params, string>
}

interface InvalidSubscribeUsage<Method extends string> {
    subscribe: TypedAPITypeError<`Server sent events can only be subscribed to using the GET method. The ${Method} handler cannot be used.`>
}


/***** UTLITY FUNCTIONS *****/

/**
 * EventSource is GET-only. `MapGET` reports invalid usage as a 
 * type error if the subscription request method (first parameter)
 * is not GET, and returns the second parameter otherwise.
 */
type MapGET<Method extends string, IfGET> =
    Method extends "GET"
        ? IfGET
        : InvalidSubscribeUsage<Method>

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

type IsEmptyUnion<T> = (T extends never ? true : false) extends true ? true : false  
