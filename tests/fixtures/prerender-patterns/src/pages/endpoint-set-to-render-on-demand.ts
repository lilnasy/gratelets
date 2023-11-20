import type { APIRoute } from "astro"

export const prerender = false

export const GET: APIRoute = ctx => new Response(ctx.request.url)
