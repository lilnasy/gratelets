import { test, expect, describe } from "vitest"
import { dataToParams, paramsToData } from "../packages/typed-api/runtime/param-codec.ts"

const samples = [
    {
        id: "simple object",
        data: { key1: "value1", key2: "value2" },
        params: "key1=value1&key2=value2"
    },
    {
        id: "nested object",
        data: { key1: { key2: { key3: "value" } } },
        params: "key1.key2.key3=value"
    },
    {
        id: "arrays",
        data: { key: [ "value1", "value2", "value3" ] },
        params: "key.a=&key.0=value1&key.1=value2&key.2=value3"
    },
    {
        id: "string as the only value",
        data: "value",
        params: "=value"
    },
    {
        id: "number as the only value",
        data: 1,
        params: ".n=1"
    },
    {
        id: "bigint as the only value",
        data: 1n,
        params: ".i=1"
    },
    {
        id: "boolean as the only value",
        data: true,
        params: ".b=true"
    },
    {
        id: "null as the only value",
        data: null,
        params: ".x="
    },
    {
        id: "array as the only value",
        data: [ "value1", "value2", "value3" ],
        params: "0=value1&1=value2&2=value3&.a="
    },
    {
        id: "deep nesting",
        data:  {
            a: {
                b: {
                    c: "value",
                    d: 1
                },
                e: 1n
            },
            f: null,
            g: [ 1, 2, { h: "value" } ]
        },
        params: "a.b.c=value&a.b.d.n=1&a.e.i=1&f.x=&g.a=&g.0.n=1&g.1.n=2&g.2.h=value"
    }
]

describe("serialization", () => {
    for (const sample of samples) {
        test(sample.id, () => {
            const params = dataToParams(sample.data)
            const urlSearchParams = new URLSearchParams(params)
            expect(String(urlSearchParams)).toEqual(sample.params)
        })
    }
})

describe("deserialization", () => {
    for (const sample of samples) {
        test(sample.id, () => {
            const urlSearchParams = new URLSearchParams(sample.params)
            const params = Object.fromEntries(urlSearchParams.entries())
            const data = paramsToData(params)
            expect(data).toEqual(sample.data)
        })
    }
})
