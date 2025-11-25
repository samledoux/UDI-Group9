import { NextResponse } from "next/server";
import { incrementAlighting } from "../../../../server/busStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, route, destination, stopId } = body ?? {};

    if (typeof stopId !== "string") {
      return NextResponse.json(
        { error: "Invalid payload. Expected { id?: string, route?: string, stopId: string, destination?: string }" },
        { status: 400 }
      );
    }

    // Either id or route must be provided
    if (!id && typeof route !== "string") {
      return NextResponse.json(
        { error: "Either 'id' or 'route' must be provided" },
        { status: 400 }
      );
    }

    const updated = incrementAlighting({ id, route, destination, stopId });
    if (!updated) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, bus: updated });
  } catch (err) {
    return NextResponse.json({ error: "Bad JSON payload" }, { status: 400 });
  }
}

