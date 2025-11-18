"use client";
import { useMemo, useState, useEffect } from "react";
import { stops, type BusInfo } from "../data/buses";

export default function Home() {
  const [selectedStopId, setSelectedStopId] = useState(stops[0]?.id ?? "");
  const [buses, setBuses] = useState<BusInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const filteredBuses = useMemo(() => {
    // Only show buses that have an ETA for the selected stop
    return buses
      .map((b) => ({
        ...b,
        etaForSelectedStop:
          selectedStopId && b.perStopEta[selectedStopId] !== undefined
            ? b.perStopEta[selectedStopId]
            : undefined,
      }))
      .filter((b) => b.etaForSelectedStop !== undefined)
      .sort((a, b) => (a.etaForSelectedStop! - b.etaForSelectedStop!));
  }, [selectedStopId, buses]);

  return (
    <div className="min-h-screen bg-zinc-50 py-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 sm:px-10">
        <header className="flex flex-col gap-2 text-center sm:text-left">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Live Departures
          </p>
          <h1 className="text-4xl font-bold">Campus Bus Tracker</h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Check when the next buses arrive and whether the wheelchair space
            is currently available.
          </p>
        </header>

        {/* Route Map */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Route Map</h2>
          <div className="flex flex-col gap-6">
            {/* E1 Route */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                  E1
                </span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Northwood → Bray/Ballywaltrim
                </span>
              </div>
              <div className="ml-4 flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span>Northwood</span>
                <span className="text-blue-500">→</span>
                <span>DCU</span>
                <span className="text-blue-500">→</span>
                <span>Phibsborough</span>
                <span className="text-blue-500">→</span>
                <span>Parnell Square</span>
                <span className="text-blue-500">→</span>
                <span>O'Connell St</span>
                <span className="text-blue-500">→</span>
                <span>College Green</span>
                <span className="text-blue-500">→</span>
                <span>Bray</span>
                <span className="text-blue-500">/</span>
                <span>Ballywaltrim</span>
              </div>
            </div>

            {/* E2 Route */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-semibold text-white">
                  E2
                </span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Harristown → Dún Laoghaire
                </span>
              </div>
              <div className="ml-4 flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span>Harristown</span>
                <span className="text-green-500">→</span>
                <span>DCU</span>
                <span className="text-green-500">→</span>
                <span>Phibsborough</span>
                <span className="text-green-500">→</span>
                <span>Parnell Square</span>
                <span className="text-green-500">→</span>
                <span>O'Connell St</span>
                <span className="text-green-500">→</span>
                <span>College Green</span>
                <span className="text-green-500">→</span>
                <span>Dún Laoghaire</span>
              </div>
            </div>

            {/* 29A Route */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-semibold text-white">
                  29A
                </span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Baldoyle → City Centre
                </span>
              </div>
              <div className="ml-4 flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <span>Baldoyle</span>
                <span className="text-purple-500">→</span>
                <span>Donaghmede</span>
                <span className="text-purple-500">→</span>
                <span>Raheny</span>
                <span className="text-purple-500">→</span>
                <span>Clontarf</span>
                <span className="text-purple-500">→</span>
                <span>Fairview</span>
                <span className="text-purple-500">→</span>
                <span>North Strand</span>
                <span className="text-purple-500">→</span>
                <span>O'Connell St</span>
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
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
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

              return (
                <li
                  key={bus.id}
                  className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-lg font-semibold text-zinc-900 dark:border-zinc-700 dark:text-zinc-100">
                        {bus.route}
                      </span>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {bus.destination}
                        </p>
                        <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                          Arrives in {bus.etaForSelectedStop} min
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${seatColor}`}
                    >
                      {seatLabel}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

      </main>
    </div>
  );
}
