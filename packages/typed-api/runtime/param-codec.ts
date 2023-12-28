/**
 * Used for sending data in the url as params in GET requests.
 * Same idea as jquery.param, but intended to be readable and typed.
 */

/**
 * Flattens a nested object into a record of key-value string pairs.
 * 
 * For example, this input...
 * ```js
 * {
 *     a: {
 *         b: {
 *             c: "value",
 *             d: 1
 *         },
 *         e: 2n
 *     },
 *     f: null,
 *     g: [ 3, 4, { h: "value" } ]
 * }
 * ```
 * ...will produce this output:
 * ```js
 * {
 *     "a.b.c": "value",
 *     "a.b.d.n": "1",
 *     "a.e.i": "2",
 *     "f.x": "",
 *     "g.a": "",
 *     "g.0.n": "3",
 *     "g.1.n": "4",
 *     "g.2.h": "value"
 * }
 * ```
 */
export function dataToParams(value: unknown, keyPath: string[] = [], params: Record<string, string> = {}) {
    if (value === undefined) return params
    const type = typeof value
    const typeSuffix =
        value === null ? ".x" :
        type === "boolean" ? ".b" :
        type === "number" ? ".n" :
        type === "bigint" ? ".i" :
        type === "string" ? "" : undefined
    if (typeSuffix !== undefined) {
        const key = keyPath.map(escapeDots).map(escapeTypeSuffix).join(".") + typeSuffix
        params[key] = value === null ? "" : String(value)
        return params
    }
    const { constructor } = value!
    if (constructor === Array || constructor === Object) {
        if (constructor === Array) {
            // this entry makes the decoder create an array
            // which will then be assigned individual indexes as if it was an obejct
            // and it will just work
            const key = keyPath.map(escapeDots).map(escapeTypeSuffix).join(".") + ".a"
            params[key] = ""
        }
        for (const subKey in value) {
            dataToParams(value[subKey as keyof typeof value], [...keyPath, escapeDots(subKey)], params)
        }
        return params
    }
    throw new TypeError(`Cannot encode a ${type} to URLSearchParams`, {
        cause: { keyPath, value }
    })
}

const typeSuffixPattern = /\.[xbnia]$/

export function paramsToData(params: Record<string, string>): unknown {
    const keys = Object.keys(params)
    if (keys.length === 0) return undefined
    let data_ = {} as any
    if (keys.includes(".a")) {
        keys.splice(keys.indexOf(".a"), 1)
        data_ = []
    }
    const data = data_
    for (const key of keys) {
        const stringValue = params[key]
        const [ typeSuffix ] = key.match(typeSuffixPattern) ?? []
        const typedValue =
            typeSuffix === ".x" ? null :
            typeSuffix === ".b" ? stringValue === "true" :
            typeSuffix === ".n" ? Number(stringValue) :
            typeSuffix === ".i" ? BigInt(stringValue) :
            typeSuffix === ".a" ? [] : undefined
        const pathKey = key.replace(/\.[xbnia]$/, "")
        const path = pathKey.split(".").map(unescapeDots).map(unescapeTypeSuffix)
        const value = typedValue === undefined ? stringValue : typedValue
        let subValue = data
        while (path.length > 1) {
            const subKey = path.shift()!
            subValue[subKey] ??= {}
            subValue = subValue[subKey]
        }
        const subKey = path.shift()!
        subValue[subKey] = value
    }
    if (Object.keys(data).length === 1 && "" in data) return data[""]
    return data
}

/** 
 * Dots are used as the separator for nested keys.
 * This function handles the case where the key itself contains a dot.
 * { "a.b": "c" } -> { "a%2Eb": "c" }
 */
function escapeDots(str: string) {
    return str.replaceAll(".", "%2E")
}

function unescapeDots(str: string) {
    return str.replaceAll("%2E", ".")
}

/**
 * x, b, n, i, a are used as type suffixes.
 * This function handles the case where the last key itself is exactly one of those suffixes.
 * { "a": "b" } -> { "_a": "b" }
 */
function escapeTypeSuffix(str: string, index: number, array: string[]) {
    if (index !== array.length - 1) return str
    if (str.match(/^[xbnia]$/)) return "_" + str
    return str
}

/**
 * There is a mishandled corner case where 
 * ```ts
 * { _a: { _x: 1 } }
 * ```
 * will be converted into
 * ```
 * { _a: { x: 1 } }
 * ```
 */
function unescapeTypeSuffix(str: string, index: number, array: string[]) {
    if (index !== array.length - 1) return str
    if (str.match(/^_[xbnia]$/)) return str.slice(1)
    return str
}
