import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import TicketEvent from "@/models/TicketEvent"
import type { PluginApiContext } from "@/plugins/types"

export async function handleTicketingApi(context: PluginApiContext): Promise<Response> {
  const [segment, ...rest] = context.path

  if (segment === "status" && context.request.method === "GET") {
    await dbConnect()
    const eventCount = await TicketEvent.countDocuments()
    return NextResponse.json({
      ok: true,
      pluginId: context.pluginId,
      eventCount,
      config: context.config,
    })
  }

  if (segment === "events" && context.request.method === "GET") {
    await dbConnect()
    const events = await TicketEvent.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return NextResponse.json({ ok: true, events })
  }

  if (segment === "events" && context.request.method === "POST" && rest.length === 0) {
    const sessionRole = context.request.headers.get("x-plugin-internal")
    if (sessionRole !== "admin-seed") {
      return NextResponse.json({ error: "Use admin UI to create events (not implemented)" }, { status: 501 })
    }
    const body = (await context.request.json()) as {
      slug?: string
      title?: string
      priceHuf?: number
      capacity?: number
    }
    if (!body.slug || !body.title) {
      return NextResponse.json({ error: "slug and title required" }, { status: 400 })
    }
    await dbConnect()
    const created = await TicketEvent.create({
      slug: body.slug,
      title: body.title,
      priceHuf: body.priceHuf ?? 0,
      capacity: body.capacity ?? 0,
      soldCount: 0,
      isPublished: false,
    })
    return NextResponse.json({ ok: true, event: created })
  }

  return NextResponse.json(
    { error: "Not found", path: context.path },
    { status: 404 }
  )
}
