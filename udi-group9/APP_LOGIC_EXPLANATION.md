# UDI TFI Live - App Logic Explanation

## Overview
This is a real-time bus tracking application that displays:
- Live bus arrivals at selected stops
- Current seat availability
- Wheelchair space availability
- **Predicted seat availability** at future stops based on passenger alighting data

---

## Architecture Overview

### Data Flow
```
Arduino Sensors (on bus)
    ↓
API Endpoints (/api/buses/*)
    ↓
busStore.ts (in-memory state)
    ↓
API Route (/api/buses)
    ↓
Frontend (page.tsx)
    ↓
User Interface
```

---

## Core Data Structure

### BusInfo Type
```typescript
{
  id: string;                    // Unique bus ID (e.g., "E1-001")
  route: string;                 // Route number (e.g., "E1")
  destination: string;           // Final destination
  etaMinutes: number;            // ETA to selected stop (deprecated, uses perStopEta)
  wheelchair_available: boolean; // Real-time wheelchair space status
  perStopEta: Record<string, number>; // ETA (in minutes) for each stop
  seats: { id: string; available: boolean }[]; // Current seat status array
  peopleGettingOff: Record<string, number>; // How many people alight at each stop
}
```

### Key Properties Explained

1. **`seats`** - Array of all seats on the bus
   - Each seat has: `{ id: "E1-001-SEAT-1", available: true/false }`
   - This is the **current state** as reported by sensors
   - Example: `[{id: "E1-001-SEAT-1", available: true}, {id: "E1-001-SEAT-2", available: false}, ...]`

2. **`peopleGettingOff`** - Predictive data for future stops
   - Maps stop IDs to number of people expected to alight
   - Example: `{ stop_dcu: 3, stop_phibsborough: 5, ... }`
   - Used to calculate future seat availability

3. **`perStopEta`** - Estimated time of arrival for each stop
   - Sorted by ETA to determine bus route order
   - Example: `{ stop_dcu: 3, stop_phibsborough: 8, stop_parnell: 11, ... }`

---

## Seat Occupancy Calculation Logic

### Current Seat Availability (Simple)
```typescript
// Lines 258-259 in page.tsx
const seatsAvailable = Array.isArray(bus.seats) 
  ? bus.seats.filter((s) => s.available).length 
  : 0;
const seatsTotal = Array.isArray(bus.seats) ? bus.seats.length : 0;
```

**This simply counts:**
- Total seats: Length of `bus.seats` array
- Available seats: Number of seats where `available === true`
- Occupied seats: `seatsTotal - seatsAvailable`

---

### Predictive Seat Calculation (At Selected Stop)

The app predicts how many seats will be available when the bus **arrives at the user's selected stop**.

#### Step-by-Step Process:

1. **Determine Bus Route Order**
   ```typescript
   // Lines 273-275
   const busRouteOrder = Object.entries(bus.perStopEta)
     .sort(([_, etaA], [__, etaB]) => etaA - etaB)  // Sort by ETA (ascending)
     .map(([stopId]) => stopId);  // Extract stop IDs
   ```
   - Sorts stops by ETA (closest first)
   - Creates ordered array: `["stop_dcu", "stop_phibsborough", "stop_parnell", ...]`

2. **Find Selected Stop Position**
   ```typescript
   // Line 278
   const selectedStopIndex = busRouteOrder.indexOf(selectedStopId);
   ```

3. **Calculate Seats at Selected Stop**
   ```typescript
   // Lines 282-289
   let seatsAtSelectedStop = seatsAvailable;  // Start with current available seats
   
   if (selectedStopIndex >= 0) {
     // Get all stops BEFORE the selected stop
     const stopsBeforeSelected = busRouteOrder.slice(0, selectedStopIndex);
     
     // For each stop before selected stop:
     stopsBeforeSelected.forEach((stopId) => {
       // Add the people getting off at that stop
       // (they free up seats before reaching selected stop)
       seatsAtSelectedStop += bus.peopleGettingOff?.[stopId] || 0;
     });
   }
   
   // Clamp between 0 and total seats (safety check)
   seatsAtSelectedStop = Math.min(seatsTotal, Math.max(0, seatsAtSelectedStop));
   ```

#### Example Calculation:

**Scenario:**
- Bus currently has **30 available seats** out of 45 total
- Bus route order: `[stop_dcu, stop_phibsborough, stop_parnell, stop_selected]`
- Selected stop: `stop_parnell` (index 2)
- People getting off:
  - `stop_dcu`: 3 people
  - `stop_phibsborough`: 5 people

**Calculation:**
```
seatsAtSelectedStop = 30  // Start with current available seats
                    + 3    // People getting off at stop_dcu (before selected)
                    + 5    // People getting off at stop_phibsborough (before selected)
                    = 38 seats available at stop_parnell
```

**Logic:** People getting off at stops before your stop will free up seats before the bus reaches you.

---

### Predictive Seat Calculation (For Upcoming Stops)

When a bus is expanded, the app shows seat availability at **each upcoming stop**.

#### Logic for Each Stop:

```typescript
// Lines 299-333
upcomingStops = busRouteOrder
  .filter((stopId) => bus.perStopEta[stopId] > 0)  // Only future stops
  .map((stopId) => {
    let seatsAtStop = seatsAvailable;  // Start with current seats
    const stopIndex = busRouteOrder.indexOf(stopId);
    
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
    
    return {
      stopId,
      eta: bus.perStopEta[stopId],
      seatsAvailable: Math.max(0, seatsAtStop),  // Ensure non-negative
      peopleGettingOff: bus.peopleGettingOff?.[stopId] || 0
    };
  })
```

#### Example for Upcoming Stops:

**Scenario:**
- Selected stop: `stop_parnell` (index 2)
- Current available: 30 seats
- Route: `[stop_dcu, stop_phibsborough, stop_parnell, stop_oconnell, stop_college_green]`

**For `stop_oconnell` (index 3, after selected):**
```
seatsAtStop = 30  // Current available
            + 7   // People getting off at stop_parnell (between selected and oconnell)
            = 37 seats available
```

**For `stop_phibsborough` (index 1, before selected):**
```
seatsAtStop = 30  // Current available
            - 7   // People getting off at stop_parnell (haven't gotten off yet)
            = 23 seats available
```

---

## How Seat Status is Updated

### 1. Initial State (Mock Data)
```typescript
// In buses.ts - Lines 58, 85, etc.
seats: Array.from({ length: 45 }, (_, i) => ({ 
  id: `E1-001-SEAT-${i + 1}`, 
  available: i % 4 !== 0  // Pattern: every 4th seat unavailable
}))
```

### 2. Real-Time Updates via API

#### API Endpoint: `/api/buses/seats` (POST)
```typescript
// busStore.ts - updateSeats() function
// Two modes:

// Mode 1: Set all seats to available/unavailable
{ id: "E1-001", set_all_available: true }

// Mode 2: Update specific seats
{
  id: "E1-001",
  seats: [
    { id: "E1-001-SEAT-1", available: false },
    { id: "E1-001-SEAT-2", available: true },
    ...
  ]
}
```

#### How It Works:
1. Arduino sensors detect seat occupancy
2. Arduino sends POST request to `/api/buses/seats`
3. `busStore.ts` updates the in-memory state
4. Next request to `/api/buses` returns updated data
5. Frontend refreshes display

---

## Data Update Flow

### Current Seats (Real-time from Sensors)
```
Arduino → POST /api/buses/seats → busStore.updateSeats() → In-memory state
```

### People Getting Off (Predicted/Alighting Data)
```
Arduino/System → POST /api/buses/alight → busStore.incrementAlighting() → Updates peopleGettingOff
```

### Wheelchair Space
```
Arduino → POST /api/buses/wheelchair → busStore.updateWheelchairAvailability() → Updates wheelchair_available
```

---

## Key Logic Summary

### Seat Occupancy = Current State + Predictive Changes

1. **Current Occupancy:**
   - Directly from `bus.seats` array
   - Count seats where `available === false`
   - Real-time, sensor-driven

2. **Predicted Occupancy at Selected Stop:**
   - Current available seats
   - **PLUS** people getting off at stops before your stop
   - = Seats available when bus arrives

3. **Predicted Occupancy at Future Stops:**
   - For stops after your stop: Add people getting off between
   - For stops before your stop: Subtract people getting off between
   - = Seats available when bus reaches that stop

### Important Notes:

- **`seatsAvailable`** = Current real-time state (from sensors)
- **`seatsAtSelectedStop`** = Predicted state when bus arrives at your stop
- **`peopleGettingOff`** = How many people are expected to alight at each stop
- The system assumes people getting off free up seats immediately
- Seat counts are clamped to [0, totalSeats] to prevent invalid values

---

## State Management

### In-Memory Store (`busStore.ts`)
- Stores all bus data in memory
- Updated via API endpoints
- **Resets on server restart** (not persistent)
- Used for development/testing

### For Production:
- Consider database persistence (PostgreSQL, MongoDB, etc.)
- Or Redis for distributed state
- Or persistent file storage

---

## Route Filtering Logic

### Filtering Buses (Lines 126-141)
```typescript
filteredBuses = buses
  .filter((bus) => bus.route === selectedRouteId)  // Same route
  .filter((bus) => selectedDirection.destinationMatchers.includes(bus.destination))  // Same direction
  .filter((bus) => bus.perStopEta[selectedStopId] !== undefined)  // Has ETA for selected stop
  .sort((a, b) => a.etaForSelectedStop - b.etaForSelectedStop)  // Sort by arrival time
```

Only shows buses that:
1. Match the selected route (E1, E2, 29A)
2. Match the destination (for direction)
3. Have an ETA for the selected stop
4. Are sorted by arrival time (closest first)

---

## Example Walkthrough

### User Action:
1. User selects: **Route E1**, **Southbound**, **Stop: DCU**
2. App fetches buses from `/api/buses`
3. Filters buses matching criteria
4. Displays ETA and seat availability

### For Bus E1-001:
- **Current state:** 34 available seats (11 occupied)
- **Selected stop:** DCU
- **People getting off before DCU:** 0 (DCU is first stop in route)
- **Predicted seats at DCU:** 34 seats

### For Bus E1-002:
- **Current state:** 30 available seats (15 occupied)
- **Selected stop:** College Green
- **Stops before College Green:** DCU, Phibsborough, Parnell, O'Connell
- **People getting off:**
  - DCU: 6 people
  - Phibsborough: 4 people
  - Parnell: 9 people
  - O'Connell: 2 people
- **Predicted seats at College Green:** 30 + 6 + 4 + 9 + 2 = **51 seats** (clamped to 45 max)

---

## Summary

The app uses **two types of data**:

1. **Real-time sensor data** (`seats` array) - Current occupancy from Arduino
2. **Predictive alighting data** (`peopleGettingOff`) - Expected passengers alighting

The **seat calculation algorithm**:
- Starts with current available seats
- Adds/subtracts based on passenger alighting patterns
- Predicts future seat availability at any stop
- Accounts for route order and stop sequence

This allows users to see not just current occupancy, but **predicted availability** when the bus arrives at their stop!

