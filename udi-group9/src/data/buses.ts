export type BusInfo = {
  route: string;
  destination: string;
  etaMinutes: number;
  wheelchair_available: boolean;
  perStopEta: Record<string, number>;
  seats: { id: string; available: boolean }[];
};

export type Stop = {
  id: string;
  name: string;
};

export const stops: Stop[] = [
  { id: "stop_ucd", name: "UCD Campus" },
  { id: "stop_dawson", name: "Dawson Street" },
  { id: "stop_oconnell", name: "O'Connell Street" },
  { id: "stop_blanch", name: "Blanchardstown SC" },
  { id: "stop_ongar", name: "Ongar" },
];

export const mockBuses: BusInfo[] = [
  {
    route: "E1",
    destination: "City Centre",
    etaMinutes: 4,
    wheelchair_available: true,
    perStopEta: {
      stop_ucd: 4,
      stop_dawson: 10,
      stop_oconnell: 15,
    },
    seats: Array.from({ length: 30 }, (_, i) => ({ id: `E1-CITY-${i + 1}`, available: i % 3 !== 0 })),
  },
  {
    route: "E2",
    destination: "Northside",
    etaMinutes: 6,
    wheelchair_available: false,
    perStopEta: {
      stop_ucd: 6,
      stop_dawson: 12,
      stop_oconnell: 18,
    },
    seats: Array.from({ length: 28 }, (_, i) => ({ id: `E2-NORTH-${i + 1}`, available: i % 4 !== 0 })),
  },
  {
    route: "39a",
    destination: "Ongar",
    etaMinutes: 9,
    wheelchair_available: true,
    perStopEta: {
      stop_dawson: 9,
      stop_oconnell: 13,
      stop_blanch: 32,
      stop_ongar: 40,
    },
    seats: Array.from({ length: 40 }, (_, i) => ({ id: `39A-ONGAR-${i + 1}`, available: i % 5 !== 0 })),
  },
  {
    route: "39a",
    destination: "City Centre",
    etaMinutes: 3,
    wheelchair_available: false,
    perStopEta: {
      stop_ongar: 3,
      stop_blanch: 10,
      stop_oconnell: 38,
      stop_dawson: 42,
    },
    seats: Array.from({ length: 40 }, (_, i) => ({ id: `39A-CITY-${i + 1}`, available: i % 6 !== 0 })),
  },
];

