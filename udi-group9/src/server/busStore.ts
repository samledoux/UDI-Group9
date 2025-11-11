import { mockBuses, type BusInfo } from "../data/buses";

let buses: BusInfo[] = mockBuses.map((b) => ({ ...b }));

export function getAllBuses(): BusInfo[] {
  return buses.map((b) => ({ ...b }));
}

export function updateWheelchairAvailability(params: {
  id?: string;
  route?: string;
  destination?: string;
  wheelchair_available: boolean;
}): BusInfo | null {
  const { id, route, destination, wheelchair_available } = params;
  let index = -1;
  
  // If ID is provided, use it for lookup (most specific)
  if (id) {
    index = buses.findIndex((b) => b.id === id);
  } else if (route) {
    // Fallback to route + destination lookup (backward compatibility)
    index = buses.findIndex((b) =>
      destination ? b.route === route && b.destination === destination : b.route === route
    );
  }
  
  if (index === -1) {
    return null;
  }
  buses[index] = { ...buses[index], wheelchair_available };
  return { ...buses[index] };
}

export function updateSeats(params: {
  id?: string;
  route?: string;
  destination?: string;
  seats?: { id: string; available: boolean }[];
  set_all_available?: boolean;
}): BusInfo | null {
  const { id, route, destination, seats, set_all_available } = params;
  let index = -1;
  
  // If ID is provided, use it for lookup (most specific)
  if (id) {
    index = buses.findIndex((b) => b.id === id);
  } else if (route) {
    // Fallback to route + destination lookup (backward compatibility)
    index = buses.findIndex((b) =>
      destination ? b.route === route && b.destination === destination : b.route === route
    );
  }
  
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


