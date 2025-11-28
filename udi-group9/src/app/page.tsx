"use client";
import { useMemo, useState, useEffect } from "react";
import { stops, type BusInfo } from "../data/buses";

type RouteDirection = {
  id: string;
  label: string;
  stopIds: string[];
  destinationMatchers: string[];
};

type RouteOption = {
  id: string;
  label: string;
  description: string;
  directions: RouteDirection[];
};

type SouthboundStopStat = {
  stopId: string;
  name: string;
  eta: number;
  peopleBefore: number;
  peopleAtStop: number;
};

const stopNameById = stops.reduce<Record<string, string>>((acc, stop) => {
  acc[stop.id] = stop.name;
  return acc;
}, {});

const e1StopsSouthbound = [
  "stop_northwood",
  "stop_dcu",
  "stop_phibsborough",
  "stop_parnell",
  "stop_oconnell",
  "stop_college_green",
  "stop_bray",
  "stop_ballywaltrim",
];

const e1StopsNorthbound = [...e1StopsSouthbound].reverse();

const routeOptions: RouteOption[] = [
  {
    id: "E1",
    label: "E1 • Northwood ↔ Bray/Ballywaltrim",
    description:
      "City spine via DCU, Phibsborough, Parnell Square, O'Connell Street, and College Green before branching to Bray/Ballywaltrim.",
    directions: [
      {
        id: "southbound",
        label: "Southbound to Bray/Ballywaltrim",
        stopIds: e1StopsSouthbound,
        destinationMatchers: ["Bray", "Ballywaltrim"],
      },
      {
        id: "northbound",
        label: "Northbound to Northwood",
        stopIds: e1StopsNorthbound,
        destinationMatchers: ["Northwood"],
      },
    ],
  },
];

export default function Home() {
  const defaultRoute = routeOptions[0];
  const [selectedDirectionId, setSelectedDirectionId] = useState(defaultRoute?.directions[0]?.id ?? "");
  const [selectedStopId, setSelectedStopId] = useState(defaultRoute?.directions[0]?.stopIds[0] ?? "");
  const [buses, setBuses] = useState<BusInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);

  const fetchBuses = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/buses");
      const data = await response.json();
      setBuses(data);
    } catch (error) {
      console.error("Failed to fetch buses:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const selectedRoute = defaultRoute;
  const selectedRouteId = selectedRoute?.id ?? "";

  const selectedDirection = useMemo(
    () => selectedRoute?.directions.find((direction) => direction.id === selectedDirectionId),
    [selectedRoute, selectedDirectionId],
  );
  const isSouthboundE1 = selectedRouteId === "E1" && selectedDirection?.id === "southbound";

  useEffect(() => {
    if (!selectedRoute) {
      return;
    }
    if (!selectedRoute.directions.some((direction) => direction.id === selectedDirectionId)) {
      setSelectedDirectionId(selectedRoute.directions[0]?.id ?? "");
    }
  }, [selectedRoute, selectedDirectionId]);

  useEffect(() => {
    if (!selectedDirection) {
      return;
    }
    if (!selectedDirection.stopIds.includes(selectedStopId)) {
      setSelectedStopId(selectedDirection.stopIds[0] ?? "");
    }
  }, [selectedDirection, selectedStopId]);

  const availableStops = useMemo(() => {
    if (!selectedDirection) {
      return [];
    }
    return selectedDirection.stopIds
      .map((stopId) => ({ id: stopId, name: stopNameById[stopId] ?? stopId }))
      .filter((stop) => Boolean(stop.name));
  }, [selectedDirection]);

  const filteredBuses = useMemo(() => {
    if (!selectedDirection) {
      return [];
    }

    // Only show buses that have an ETA for the selected stop
    return buses
      .filter((bus) => bus.route === selectedRouteId)
      .filter((bus) =>
        selectedDirection.destinationMatchers.length === 0
          ? true
          : selectedDirection.destinationMatchers.includes(bus.destination),
      )
      .map((bus) => ({
        ...bus,
        etaForSelectedStop:
          selectedStopId && bus.perStopEta[selectedStopId] !== undefined
            ? bus.perStopEta[selectedStopId]
            : undefined,
      }))
      .filter((bus) => bus.etaForSelectedStop !== undefined)
      .sort((a, b) => (a.etaForSelectedStop! - b.etaForSelectedStop!));
  }, [selectedRouteId, selectedDirection, selectedStopId, buses]);

  return (
    <div className="min-h-screen bg-zinc-50 py-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 sm:px-10">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Live Departures
          </p>
          <h1 className="text-4xl font-bold">UDI TFI Live</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Check when the next buses arrive and whether the wheelchair space
            is currently available.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-500">Route E1</p>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Northwood ↔ Bray/Ballywaltrim
                </h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Serving DCU, Phibsborough, Parnell Square, O&apos;Connell Street, and College Green before running
                express to Bray/Ballywaltrim. Seat and wheelchair status stream directly from the Arduino on-board.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                {e1StopsSouthbound.map((stopId, index) => (
                  <span key={stopId} className="flex items-center gap-2">
                    {stopNameById[stopId]}
                    {index !== e1StopsSouthbound.length - 1 && (
                      <span className="text-blue-500 dark:text-blue-400">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Direction
              </h3>
              <div className="flex flex-wrap gap-3">
                {selectedRoute?.directions.map((direction) => (
                  <button
                    key={direction.id}
                    type="button"
                    onClick={() => setSelectedDirectionId(direction.id)}
                    className={`flex-1 min-w-[180px] rounded-xl border px-4 py-3 text-sm font-medium transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                      selectedDirectionId === direction.id
                        ? "border-zinc-900 bg-zinc-900/5 dark:border-zinc-200 dark:bg-zinc-100/5"
                        : "border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {direction.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="stop-select" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Stop
            </label>
            <select
              id="stop-select"
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {availableStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
            <button
              onClick={fetchBuses}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Refresh bus data"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.25 9.348h4.992m4.992 0a3.001 3.001 0 0 0 4.992-3.553M3.25 9.348a3.001 3.001 0 0 1 4.992-3.553m4.992 0a3.001 3.001 0 0 1 3.553 4.992m-3.553 4.992a3.001 3.001 0 0 0-3.553 4.992m3.553-4.992h4.992m-4.992 0a3.001 3.001 0 0 1-3.553-4.992m3.553 4.992H3.25m8.25-8.25v8.25m0-8.25a3.001 3.001 0 0 0-4.992 3.553m4.992-3.553a3.001 3.001 0 0 1 4.992 3.553M12.75 21.348v-8.25m0 8.25a3.001 3.001 0 0 0 4.992-3.553M12.75 21.348a3.001 3.001 0 0 1-4.992-3.553m4.992 3.553h4.992m-4.992 0a3.001 3.001 0 0 1-3.553-4.992"
                />
              </svg>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredBuses.map((bus: any) => {
              const statusLabel = bus.wheelchair_available
                ? "Wheelchair spot available"
                : "Wheelchair spot occupied";
              const statusColor = bus.wheelchair_available
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
              const seatsAvailable =
                Array.isArray(bus.seats) ? bus.seats.filter((s: any) => s.available).length : 0;
              const seatsTotal = Array.isArray(bus.seats) ? bus.seats.length : 0;
              const seatLabel =
                seatsTotal > 0
                  ? `${seatsAvailable} of ${seatsTotal} seats available`
                  : "Seat availability unknown";
              const seatColor =
                seatsAvailable === 0 && seatsTotal > 0
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

              const isExpanded = expandedBusId === bus.id;
              
              // Determine bus route order by sorting stops by ETA
              const busRouteOrder = Object.entries(bus.perStopEta)
                .sort(([_, etaA], [__, etaB]) => (etaA as number) - (etaB as number))
                .map(([stopId]) => stopId);
              
              // Find the index of the selected stop in the bus route
              const selectedStopIndex = busRouteOrder.indexOf(selectedStopId);
              
              // Calculate a simple seat tally for the selected stop:
              // take the total seat count (45) and subtract the currently available seats.
              // This ensures the number shown under the chip aligns with the headline chip.
              const seatsAtSelectedStop =
                seatsTotal > 0
                  ? Math.max(0, seatsTotal - seatsAvailable)
                  : 0;

              let cumulativeDisembarking = 0;
              const southboundStopStats = isSouthboundE1
                ? e1StopsSouthbound.reduce<SouthboundStopStat[]>((acc, stopId) => {
                    const eta = bus.perStopEta[stopId];
                    if (typeof eta !== "number" || eta <= 0) {
                      return acc;
                    }
                    const peopleAtStop = bus.peopleGettingOff?.[stopId] ?? 0;
                    acc.push({
                      stopId,
                      name: stopNameById[stopId] || stopId,
                      eta,
                      peopleBefore: cumulativeDisembarking,
                      peopleAtStop,
                    });
                    cumulativeDisembarking += peopleAtStop;
                    return acc;
                  }, [])
                : [];

              const peopleDisembarkingBeforeSelectedStop = isSouthboundE1
                ? southboundStopStats.find((stop) => stop.stopId === selectedStopId)?.peopleBefore ?? 0
                : 0;
              
              // Get all stops that haven't been reached yet (ETA > 0), including stops before selected stop
              const upcomingStops = selectedStopIndex >= 0
                ? busRouteOrder
                    .filter((stopId) => {
                      // Include stops that haven't been reached yet (ETA > 0)
                      // This includes stops before and after the selected stop
                      return bus.perStopEta[stopId] > 0;
                    })
                    .map((stopId) => {
                      const eta = bus.perStopEta[stopId];
                      const peopleGettingOff = bus.peopleGettingOff?.[stopId] || 0;
                      const stopIndex = busRouteOrder.indexOf(stopId);
                      
                      // Calculate seats available when bus reaches this stop
                      let seatsAtStop = seatsAvailable;
                      
                      if (stopIndex < selectedStopIndex) {
                        // Stop comes BEFORE selected stop
                        // Subtract people getting off between this stop and selected stop
                        // (those people haven't gotten off yet, so fewer seats available)
                        const stopsBetween = busRouteOrder.slice(stopIndex + 1, selectedStopIndex + 1);
                        stopsBetween.forEach((prevStopId) => {
                          seatsAtStop -= bus.peopleGettingOff?.[prevStopId] || 0;
                        });
                      } else if (stopIndex > selectedStopIndex) {
                        // Stop comes AFTER selected stop
                        // Add people getting off between selected stop and this stop
                        // (those people will get off, freeing seats)
                        const stopsBetween = busRouteOrder.slice(selectedStopIndex + 1, stopIndex);
                        stopsBetween.forEach((prevStopId) => {
                          seatsAtStop += bus.peopleGettingOff?.[prevStopId] || 0;
                        });
                      }
                      // If stopIndex === selectedStopIndex, seatsAtStop remains seatsAvailable
                      
                      return {
                        stopId,
                        eta,
                        name: stopNameById[stopId] || stopId,
                        peopleGettingOff,
                        seatsAvailable: Math.max(0, seatsAtStop), // Ensure non-negative
                      };
                    })
                    .sort((a, b) => a.eta - b.eta) // Sort by ETA
                : [];

              return (
                <li
                  key={bus.id}
                  className="flex flex-col gap-3 px-6 py-6"
                >
                  <div 
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                    onClick={() => setExpandedBusId(isExpanded ? null : bus.id)}
                  >
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                          {bus.route}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {bus.destination}
                          </p>
                          <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                            Arrives in {bus.etaForSelectedStop} min
                          </p>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`h-5 w-5 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${seatColor}`}
                        >
                          {seatLabel}
                        </span>
                        {isSouthboundE1 ? (
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            {peopleDisembarkingBeforeSelectedStop}{" "}
                            {peopleDisembarkingBeforeSelectedStop === 1 ? "person" : "people"} disembarking before your stop
                          </span>
                        ) : (
                          seatsTotal > 0 && (
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              {seatsAtSelectedStop} seats currently occupied at {stopNameById[selectedStopId] || "this stop"}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && upcomingStops.length > 0 && (
                    <div className="mt-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        Upcoming Stops
                      </h4>
                      <ul className="space-y-3">
                        {upcomingStops.map((stop) => (
                          <li
                            key={stop.stopId}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {stop.name}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {stop.eta} min
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                {stop.peopleGettingOff} {stop.peopleGettingOff === 1 ? "person" : "people"} getting off
                              </span>
                              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                {stop.seatsAvailable} seats available
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isExpanded && isSouthboundE1 && southboundStopStats.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        Southbound E1 offload forecast
                      </h4>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {southboundStopStats.map((stop) => (
                          <li
                            key={stop.stopId}
                            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{stop.name}</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{stop.eta} min</span>
                              </div>
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                                {stop.peopleBefore} {stop.peopleBefore === 1 ? "person" : "people"} before
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                              {stop.peopleAtStop} {stop.peopleAtStop === 1 ? "person" : "people"} getting off at this stop
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

      </main>
    </div>
  );
}
