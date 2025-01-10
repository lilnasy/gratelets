import type { TypedAPIHandler } from "./runtime/server.ts"
import type { ErrorResponse } from "./runtime/error-response.ts"
import type * as ClientErrors from "./runtime/errors.client.ts"

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
            : InvalidUsage<"The method of an API Route must be exported as uppercase.">
        : InvalidUsage<"The method of an API Route must be exported as uppercase.">
}

type MethodProxy<MethodExport, Params extends string, Method extends string> =
    MethodExport extends TypedAPIHandler<infer Input, infer Output>
        ? Fetcher<Input, Output, Params, Method>
        : InvalidUsage<"This export from the API Route is not a typed handler. Please make sure it is created using either `defineApiRoute` or `defineEndpoint`, which are exported by the module `\"astro-typed-api/server\"`.">

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
        : "Types for this route with params could not be generated. This is probably a bug. Please open an issue with the minimal reproduction steps."


/***** CALLABLE FUNCTIONS *****/

export type Fetcher<
    Input,
    Output,
    Params extends string,
    Method extends string
> = 
    IsEmptyUnion<Params> extends true
        ? Method extends "ALL"
            ? Fetchable.RequiresMethod<Input, Output>
            : unknown extends Input
                ? Fetchable.InputOptional<Input, Output>
                : Fetchable<Input, Output>
        // When there is a dynamic segment in the path
        // (pages/api/[x].ts -> client.api._x.GET) the
        // options should become required and they must
        // have the params field.
        : Method extends "ALL"
            ? Fetchable.RequiresMethodAndParams<Input, Output, Params>
            : Fetchable.RequiresParams<Input, Output, Params>


/***** FETCH FUNCTION *****/

interface Fetchable<Input, Output> {
    fetch(input: Input, options?: FetchOptions): Result<Output>
}

namespace Fetchable {
    export interface InputOptional<Input, Output> {
        fetch(input?: Input, options?: FetchOptions): Result<Output>
    }
    export interface RequiresMethod<Input, Output> {
        fetch(input: Input, options: FetchOptionsWithMethod): Result<Output>
    }
    export interface RequiresParams<Input, Output, Params extends string> {
        fetch(input: Input, options: FetchOptionsWithParams<Params>): Result<Output>
    }
    export interface RequiresMethodAndParams<Input, Output, Params extends string> {
        fetch(input: Input, options: FetchOptionsWithMethodAndParams<Params>): Result<Output>
    }
}

interface Result<L> extends Omit<Promise<Exclude<L, ErrorResponse<any>>>, "catch"> {
    catch<R>(on_rejection:
        (error:
            | (L extends ErrorResponse<infer Type extends string>
                ? ClientErrors.CustomError<Type>
                : never)
            | ClientErrors.InvalidUsage
            | ClientErrors.NetworkError
            | ClientErrors.UnusableResponse
        ) => R | PromiseLike<R>
    ): Promise<Exclude<L, ErrorResponse<any>> | R>
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

export interface InvalidUsage<Message> {
    reason: Message
}

export type MapAny<T, IfAny> = (T extends never ? true : false) extends false ? T : IfAny

type MapString<T, IfString> = T extends string ? string extends T ? IfString : T : T

type IsEmptyUnion<T> = (T extends never ? true : false) extends true ? true : false  
