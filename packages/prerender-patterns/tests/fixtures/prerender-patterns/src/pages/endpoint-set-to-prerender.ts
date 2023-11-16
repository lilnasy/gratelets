import type { APIRoute } from "astro"

export const prerender = true

export const GET: APIRoute = ctx => new Response(ctx.request.url)
