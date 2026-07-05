import React, { useState } from "react";
import { Plus, Check, CalendarDays, User, Compass, DollarSign, RefreshCw, X, Armchair } from "lucide-react";
import { Trip, ERPState } from "../types";
import SeatMap from "./SeatMap";

interface TripsViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function TripsView({ state, onUpdateState }: TripsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSeatMapTrip, setSelectedSeatMapTrip] = useState<Trip | null>(null);
  const [routeFrom, setRouteFrom] = useState("Jigjiga");
  const [routeTo, setRouteTo] = useState("Wajaale");
  const [busNo, setBusNo] = useState("BJ-21");
  const [driverName, setDriverName] = useState("Abdi Hassan");
  const [departureTime, setDepartureTime] = useState("06:30 AM");
  const [price, setPrice] = useState(450);

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();

    const newTrip: Trip = {
      tripId: `TRP-${Math.floor(100 + Math.random() * 900)}`,
      routeFrom,
      routeTo,
      busNo,
      driverName,
      departureTime,
      arrivalTime: "TBD",
      price,
      capacity: 40,
      bookedSeats: 0,
      status: "ON TIME",
      attendanceLocked: false,
      attendanceOverridden: false
    };

    const updatedState = { ...state };
    updatedState.trips.unshift(newTrip);

    // Append to audit logs
    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Create Trip",
      details: `Created new daily trip schedule ${newTrip.tripId} (${routeFrom} → ${routeTo}) using bus ${busNo}.`
    });

    onUpdateState(updatedState);
    setShowAddForm(false);
  };

  const handleUpdateStatus = (tripId: string, newStatus: Trip["status"]) => {
    const updatedState = { ...state };
    updatedState.trips = updatedState.trips.map(trip => {
      if (trip.tripId === tripId) {
        return { ...trip, status: newStatus };
      }
      return trip;
    });

    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Update Trip Status",
      details: `Updated status of trip ${tripId} to ${newStatus}.`
    });

    onUpdateState(updatedState);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Trip Scheduling</h2>
          <p className="text-xs text-slate-500">Create, dispatch, and monitor scheduled transport coaches</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Trip</span>
        </button>
      </div>

      {/* Add New Trip Dialog Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Schedule Daily Coach Trip</span>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Origin Hub</label>
                  <select
                    value={routeFrom}
                    onChange={(e) => setRouteFrom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {state.routes.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Destination Hub</label>
                  <select
                    value={routeTo}
                    onChange={(e) => setRouteTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {state.routes.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Assigned Bus</label>
                  <select
                    value={busNo}
                    onChange={(e) => setBusNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {state.buses.map(b => (
                      <option key={b.busNo} value={b.busNo}>{b.busNo} — {b.model}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Assigned Driver</label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {state.drivers.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Departure Time</label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="e.g. 06:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Ticket Price (ETB)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Dispatch Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trips Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.trips.map((trip) => {
          // Count active passengers registered
          const totalRegistered = state.passengers.filter(
            p => p.destination === trip.routeTo && p.busNo === trip.busNo
          ).length;

          return (
            <div key={trip.tripId} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono">
                  {trip.tripId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                  trip.status === "ON TIME" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                  trip.status === "DELAYED" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                  trip.status === "DEPARTED" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                  "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                  {trip.status}
                </span>
              </div>

              {/* Destination route banner */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Assigned Route</span>
                </div>
                <div className="text-base font-black text-slate-800 flex items-center gap-2 mt-1">
                  <span>{trip.routeFrom}</span>
                  <span className="text-purple-600">→</span>
                  <span>{trip.routeTo}</span>
                </div>
              </div>

              {/* Driver and Coach Details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Coach Coach</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trip.busNo}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Assigned Driver</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trip.driverName}</span>
                  </div>
                </div>
              </div>

              {/* Pricing, Seats & capacity details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Ticket Fare</span>
                  <div className="flex items-center gap-0.5 text-xs font-extrabold text-slate-800">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trip.price} ETB</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Registered Seats</span>
                  <div className="text-xs font-bold text-slate-700">
                    <span className="text-purple-700 font-extrabold">{totalRegistered}</span>
                    <span className="text-slate-400"> / {trip.capacity}</span>
                  </div>
                </div>
              </div>

              {/* View Live Seat Map Interactive Button */}
              <button
                type="button"
                onClick={() => setSelectedSeatMapTrip(trip)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Armchair className="w-3.5 h-3.5 text-purple-600" />
                <span>View Live Seat Map</span>
              </button>

              {/* Status Update Select Buttons */}
              <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 shrink-0 uppercase">Dispatches:</span>
                <div className="flex gap-1 overflow-x-auto py-1 w-full scrollbar-none">
                  {["ON TIME", "DELAYED", "DEPARTED", "CANCELLED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(trip.tripId, st as Trip["status"])}
                      className={`text-[9px] font-black px-1.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap uppercase ${
                        trip.status === st
                          ? "bg-purple-900 text-white shadow-xs"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {st === "ON TIME" ? "On Time" : st === "DELAYED" ? "Delayed" : st === "DEPARTED" ? "Depart" : "Cancel"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Seat Map Drawer/Modal Overlay */}
      {selectedSeatMapTrip && (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Armchair className="w-4 h-4 text-purple-700" />
                <span className="font-black text-slate-850 text-xs uppercase tracking-wider">
                  Live Coach Roster Status: {selectedSeatMapTrip.tripId}
                </span>
              </div>
              <button
                onClick={() => setSelectedSeatMapTrip(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Map Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div className="bg-purple-50 text-purple-950 p-4 rounded-2xl border border-purple-100 text-xs font-semibold leading-relaxed">
                <span>Currently monitoring realtime occupancy details of <strong>{selectedSeatMapTrip.routeFrom} to {selectedSeatMapTrip.routeTo}</strong>. You can hover or tap on occupied (rose colored) seats to examine passenger profile documents.</span>
              </div>
              <SeatMap
                busNo={selectedSeatMapTrip.busNo}
                routeTo={selectedSeatMapTrip.routeTo}
                tripPassengers={state.passengers.filter(
                  p => p.destination === selectedSeatMapTrip.routeTo && p.busNo === selectedSeatMapTrip.busNo
                )}
                readOnly={true}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button
                onClick={() => setSelectedSeatMapTrip(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Seat Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
