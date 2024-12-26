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

export type ClientFunctions<
    MethodExport extends TypedAPIHandler<unknown, unknown>,
    Input,
    Output,
    Params extends string,
    Method extends string
> = 
    IsNever<Params> extends true
        // When the method is ALL, the options should become
        // required and they must have the method field.
        // FetchM is the type requiring those conditions.
        ? Method extends "ALL"
            ? MethodExport extends { fetch: unknown }
                ? MethodExport extends { subscribe: unknown }
                    // The EventSource browser built-in can only make GET requests.
                    ? FetchM<Input, Output> & InvalidSubscribeUsage<"ALL">
                    : FetchM<Input, Output>
                : never
            // Input may be optional. FetchO is the type not requiring
            // any arguments, for that case.
            : unknown extends Input
                ? MethodExport extends { fetch: unknown }
                    ? MethodExport extends { subscribe: unknown }
                        ? FetchO<Input, Output> & (Method extends "GET" ? SubscribeO<Input, Output> : InvalidSubscribeUsage<Method>)
                        : FetchO<Input, Output>
                    : never
                : MethodExport extends { fetch: unknown }
                    ? MethodExport extends { subscribe: unknown }
                        ? Fetch<Input, Output> & (Method extends "GET" ? Subscribe<Input, Output> : InvalidSubscribeUsage<Method>)
                        : Fetch<Input, Output>
                    : never
        // When there is a dynamic segment in the path
        // (pages/api/[x].ts -> client.api._x.GET) the
        // options should become required and they must
        // have the params field.
        //
        // FetchP is the type requiring the params field.
        //
        // FetchMP is the type requiring both params and
        // the method to be provided.
        : Method extends "ALL"
            ? MethodExport extends { fetch: unknown }
                ? MethodExport extends { subscribe: unknown }
                    ? FetchMP<Input, Output, Params> & InvalidSubscribeUsage<"ALL">
                    : FetchMP<Input, Output, Params>
                : never
            : MethodExport extends { fetch: unknown }
                ? MethodExport extends { subscribe: unknown }
                    ? FetchP<Input, Output, Params> & (Method extends "GET" ? SubscribeP<Input, Output, Params> : InvalidSubscribeUsage<Method>)
                    : FetchP<Input, Output, Params>
                : never

interface InvalidSubscribeUsage<Method extends string> {
    subscribe: TypedAPITypeError<`Server sent events can only be subscribed to using the GET method. The ${Method} handler cannot be used.`>
}

interface Fetch<Input, Output> {
    fetch(input: Input, options?: FetchOptions): Promise<Output>
}

interface FetchO<Input, Output> {
    fetch(input?: Input, options?: FetchOptions): Promise<Output>
}

interface FetchM<Input, Output> {
    fetch(input: Input, options: FetchOptionsM): Promise<Output>
}

interface FetchP<Input, Output, Params extends string> {
    fetch(input: Input, options: FetchOptionsP<Params>): Promise<Output>
}

interface FetchMP<Input, Output, Params extends string> {
    fetch(input: Input, options: OptionsMP<Params>): Promise<Output>
}

interface FetchOptions extends Omit<RequestInit, "body" | "method"> {}

interface FetchOptionsM extends FetchOptions, Required<Pick<RequestInit, "method">> {}

interface FetchOptionsP<Params extends string> extends FetchOptions {
    params: Record<Params, string>
}

interface OptionsMP<Params extends string> extends FetchOptionsM, FetchOptionsP<Params> {}


/***** SUBSCRIBE FUNCTION *****/

interface Subscribe<Input, Output> {
    subscribe(input: Input, options?: SubscribeOptions): AsyncIterable<Output>
}

interface SubscribeP<Input, Output, Params extends string> {
    subscribe(input: Input, options: SubscribeOptionsP<Params>): AsyncIterable<Output>
}

interface SubscribeO<Input, Output> {
    subscribe(input?: Input, options?: SubscribeOptions): AsyncIterable<Output>
}


interface SubscribeOptions extends EventSourceInit {}

interface SubscribeOptionsP<Params extends string> extends SubscribeOptions {
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
