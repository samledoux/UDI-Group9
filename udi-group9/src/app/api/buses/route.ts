import { NextResponse } from "next/server";
import { getAllBuses } from "../../../server/busStore";

export async function GET() {
  const data = getAllBuses();
  return NextResponse.json(data);
}


