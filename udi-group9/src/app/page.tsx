 "use client";
import { useMemo, useState } from "react";
import { mockBuses, stops } from "../data/buses";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"get_on" | "get_off">("get_off");
  const [selectedBoardStopId, setSelectedBoardStopId] = useState(stops[0]?.id ?? "");
  const [selectedAlightStopId, setSelectedAlightStopId] = useState(stops[1]?.id ?? stops[0]?.id ?? "");
  const selectedStopId = activeTab === "get_on" ? selectedBoardStopId : selectedAlightStopId;
  const buses = useMemo(() => {
    // Only show buses that have an ETA for the selected stop
    return mockBuses
      .map((b) => ({
        ...b,
        etaForSelectedStop:
          selectedStopId && b.perStopEta[selectedStopId] !== undefined
            ? b.perStopEta[selectedStopId]
            : undefined,
      }))
      .filter((b) => b.etaForSelectedStop !== undefined)
      .sort((a, b) => (a.etaForSelectedStop! - b.etaForSelectedStop!));
  }, [selectedStopId]);

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

        <section className="flex flex-col gap-4">
          <div className="inline-flex w-fit overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setActiveTab("get_on")}
              className={`px-4 py-2 font-medium ${activeTab === "get_on" ? "rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-700 dark:text-zinc-300"}`}
              aria-pressed={activeTab === "get_on"}
            >
              Getting on
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("get_off")}
              className={`px-4 py-2 font-medium ${activeTab === "get_off" ? "rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-700 dark:text-zinc-300"}`}
              aria-pressed={activeTab === "get_off"}
            >
              Getting off
            </button>
          </div>

          {activeTab === "get_on" ? (
            <div className="flex items-center gap-4">
              <label htmlFor="board-stop" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Boarding stop
              </label>
              <select
                id="board-stop"
                value={selectedBoardStopId}
                onChange={(e) => setSelectedBoardStopId(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label htmlFor="alight-stop" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Alighting stop
              </label>
              <select
                id="alight-stop"
                value={selectedAlightStopId}
                onChange={(e) => setSelectedAlightStopId(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {buses.map((bus: any) => {
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
                  key={`${bus.route}-${bus.destination}`}
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
