import { testFactory } from "./utils.ts"

const test = testFactory("./fixtures/hono/headers/")

test("Endpoint Simple Headers",
    createTest("/endpoints/simple", {
        "content-type": "text/plain;charset=utf-8",
        "x-hello": "world"
    })
)

test("Endpoint Astro Single Cookie Header",
    createTest("/endpoints/astro-cookies-single", {
        "content-type": "text/plain;charset=utf-8",
        "set-cookie": "from1=astro1"
    })
)

test("Endpoint Astro Multi Cookie Header", 
    createTest("/endpoints/astro-cookies-multi", {
        "content-type": "text/plain;charset=utf-8",
        "set-cookie": "from1=astro1, from2=astro2"
    })
)

test("Endpoint Response Single Cookie Header",
    createTest("/endpoints/response-cookies-single", {
        "content-type": "text/plain;charset=utf-8",
        "set-cookie": "hello1=world1"
    })
)

test("Endpoint Response Multi Cookie Header",
    createTest("/endpoints/response-cookies-multi", {
        "content-type": "text/plain;charset=utf-8",
        "set-cookie": "hello1=world1, hello2=world2"
    })
)

test("Endpoint Complex Headers Kitchen Sink", 
    createTest("/endpoints/kitchen-sink", {
        "content-type": "text/plain;charset=utf-8",
        "x-single": "single",
        "x-triple": "one, two, three",
        "set-cookie": "hello1=world1, hello2=world2"
    })
)

test("Endpoint Astro and Response Single Cookie Header",
    createTest("/endpoints/astro-response-cookie-single", {
        "content-type": "text/plain;charset=utf-8",
        "set-cookie": "from1=response1, from1=astro1"
    })
)

test("Endpoint Astro and Response Multi Cookie Header",
    createTest("/endpoints/astro-response-cookie-multi", {
        "content-type": "text/plain;charset=utf-8",
        "set-cookie": "from1=response1, from2=response2, from3=astro1, from4=astro2"
    })
)

test("Endpoint Response Empty Headers Object", 
    createTest("/endpoints/response-empty-headers-object", {
        "content-type": "text/plain;charset=UTF-8"
    })
)

test("Endpoint Response undefined Headers Object", 
    createTest("/endpoints/response-undefined-headers-object", {
        "content-type": "text/plain;charset=UTF-8"
    })
)

test("Component Astro Single Cookie Header",
    createTest("/astro/component-astro-cookies-single", {
        "content-type": "text/html",
        "set-cookie": "from1=astro1"
    })
)

test("Component Astro Multi Cookie Header",
    createTest("/astro/component-astro-cookies-multi", {
        "content-type": "text/html",
        "set-cookie": "from1=astro1, from2=astro2"
    })
)

test("Component Response Single Cookie Header",
    createTest("/astro/component-response-cookies-single", {
        "content-type": "text/html",
        "set-cookie": "from1=value1"
    })
)

test("Component Response Multi Cookie Header",
    createTest("/astro/component-response-cookies-multi", {
        "content-type": "text/html",
        "set-cookie": "from1=value1, from2=value2"
    })
)

test("Component Astro and Response Single Cookie Header", 
    createTest("/astro/component-astro-response-cookie-single", {
        "content-type": "text/html",
        "set-cookie": "from1=response1, from1=astro1"
    })
)

test("Component Astro and Response Multi Cookie Header",
    createTest("/astro/component-astro-response-cookie-multi", {
        "content-type": "text/html",
        "set-cookie": "from1=response1, from2=response2, from3=astro1, from4=astro2"
    })
)

function createTest(url: string, expectedHeaders: Record<string, string>): Parameters<typeof test>[1] {
    return async ({ expect, hono }) => {
        const response = await hono.fetch(new Request(`http://example.com${url}`))
        for (const [key, value] of Object.entries(expectedHeaders)) {
            expect(response.headers.get(key)).to.equal(value)
        }
    }
}
