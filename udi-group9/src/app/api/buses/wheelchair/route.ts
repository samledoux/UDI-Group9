import { NextResponse } from "next/server";
import { updateWheelchairAvailability } from "../../../../server/busStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { route, destination, wheelchair_available } = body ?? {};

    if (typeof route !== "string" || typeof wheelchair_available !== "boolean") {
      return NextResponse.json(
        { error: "Invalid payload. Expected { route: string, wheelchair_available: boolean, destination?: string }" },
        { status: 400 }
      );
    }

    const updated = updateWheelchairAvailability({ route, destination, wheelchair_available });
    if (!updated) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, bus: updated });
  } catch (err) {
    return NextResponse.json({ error: "Bad JSON payload" }, { status: 400 });
  }
}


