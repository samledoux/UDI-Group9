import { mockBuses, type BusInfo } from "../data/buses";

let buses: BusInfo[] = mockBuses.map((b) => ({ ...b }));

export function getAllBuses(): BusInfo[] {
  return buses.map((b) => ({ ...b }));
}

export function updateWheelchairAvailability(params: {
  route: string;
  destination?: string;
  wheelchair_available: boolean;
}): BusInfo | null {
  const { route, destination, wheelchair_available } = params;
  const index = buses.findIndex((b) =>
    destination ? b.route === route && b.destination === destination : b.route === route
  );
  if (index === -1) {
    return null;
  }
  buses[index] = { ...buses[index], wheelchair_available };
  return { ...buses[index] };
}

export function updateSeats(params: {
  route: string;
  destination?: string;
  seats?: { id: string; available: boolean }[];
  set_all_available?: boolean;
}): BusInfo | null {
  const { route, destination, seats, set_all_available } = params;
  const index = buses.findIndex((b) =>
    destination ? b.route === route && b.destination === destination : b.route === route
  );
  if (index === -1) return null;

  let updatedSeats = buses[index].seats;
  if (Array.isArray(seats)) {
    const seatMap = new Map(seats.map((s) => [s.id, s.available]));
    updatedSeats = updatedSeats.map((s) =>
      seatMap.has(s.id) ? { ...s, available: !!seatMap.get(s.id) } : s
    );
  } else if (typeof set_all_available === "boolean") {
    updatedSeats = updatedSeats.map((s) => ({ ...s, available: set_all_available }));
  }

  buses[index] = { ...buses[index], seats: updatedSeats };
  return { ...buses[index] };
}


