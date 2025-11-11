import { NextResponse } from "next/server";
import { updateSeats } from "../../../../server/busStore";

// POST body options:
// { route: string, destination?: string, seats: {id: string, available: boolean}[] }
// OR
// { route: string, destination?: string, set_all_available: boolean }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { route, destination, seats, set_all_available } = body ?? {};

    if (typeof route !== "string") {
      return NextResponse.json({ error: "route must be a string" }, { status: 400 });
    }
    const hasSeatArray = Array.isArray(seats);
    const hasToggleAll = typeof set_all_available === "boolean";
    if (!hasSeatArray && !hasToggleAll) {
      return NextResponse.json(
        { error: "provide seats array or set_all_available boolean" },
        { status: 400 }
      );
    }
    if (hasSeatArray) {
      const valid = seats.every(
        (s: any) => s && typeof s.id === "string" && typeof s.available === "boolean"
      );
      if (!valid) {
        return NextResponse.json(
          { error: "seats must be [{ id: string, available: boolean }, ...]" },
          { status: 400 }
        );
      }
    }

    const updated = updateSeats({ route, destination, seats, set_all_available });
    if (!updated) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, bus: updated });
  } catch {
    return NextResponse.json({ error: "Bad JSON payload" }, { status: 400 });
  }
}


