import React, { useState } from "react";
import { BookmarkCheck, Users, CalendarDays, Compass, Check, AlertCircle, Printer, Download, Eye, Smartphone, Trash2 } from "lucide-react";
import { Passenger, ERPState, Trip } from "../types";
import SeatMap from "./SeatMap";

interface BookingsViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function BookingsView({ state, onUpdateState }: BookingsViewProps) {
  // Booking Form State
  const [selectedTripId, setSelectedTripId] = useState(state.trips[0]?.tripId || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState("28");
  const [seatNo, setSeatNo] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState<Passenger["paymentStatus"]>("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Telebirr");

  // Selected Ticket for Modal Boarding Pass
  const [selectedTicket, setSelectedTicket] = useState<Passenger | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState("");

  const activeTrip = state.trips.find(t => t.tripId === selectedTripId) || state.trips[0];

  // Find passengers already registered on this trip
  const tripPassengers = state.passengers.filter(
    p => p.destination === activeTrip?.routeTo && p.busNo === activeTrip?.busNo
  );

  // Generate 40 seats
  const totalSeats = 40;
  const seatGrid: { num: number; occupiedBy: Passenger | null }[] = [];
  for (let i = 1; i <= totalSeats; i++) {
    const occupiedBy = tripPassengers.find(p => p.seatNo === i) || null;
    seatGrid.push({ num: i, occupiedBy });
  }

  const handleBookSeat = (e: React.FormEvent) => {
    e.preventDefault();

    if (!seatNo) {
      alert("Please select a seat from the bus seat map first.");
      return;
    }

    // Double check seat availability
    const isOccupied = tripPassengers.some(p => p.seatNo === seatNo);
    if (isOccupied) {
      alert("This seat is already occupied. Please choose an open green seat.");
      return;
    }

    const nextSn = state.passengers.length > 0 ? Math.max(...state.passengers.map(p => p.sn)) + 1 : 1;
    const ticketNo = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPassenger: Passenger = {
      sn: nextSn,
      name,
      phone,
      seatNo: Number(seatNo),
      destination: activeTrip.routeTo,
      time: activeTrip.departureTime,
      busNo: activeTrip.busNo,
      attendance: "Pending",
      ticketNo,
      gender,
      age,
      paymentStatus,
      paymentMethod
    };

    const updatedState = { ...state };
    updatedState.passengers.unshift(newPassenger);

    // Increment booked seats count for trip
    updatedState.trips = updatedState.trips.map(t => {
      if (t.tripId === selectedTripId) {
        return { ...t, bookedSeats: t.bookedSeats + 1 };
      }
      return t;
    });

    // Append to audit logs
    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Passenger Booking",
      details: `Booked seat ${seatNo} for passenger ${name} (${ticketNo}) on trip ${selectedTripId}.`
    });

    onUpdateState(updatedState);

    // Show dynamic Boarding Pass ticket immediately
    setSelectedTicket(newPassenger);

    // Reset Form
    setName("");
    setPhone("");
    setGender("Male");
    setAge("28");
    setSeatNo("");

    setShowSuccessToast(`Successfully booked seat for ${name}!`);
    setTimeout(() => setShowSuccessToast(""), 4000);
  };

  const handleDeleteBooking = (sn: number, passengerName: string, ticketNo: string) => {
    if (!window.confirm(`Are you sure you want to cancel the booking for ${passengerName}?`)) {
      return;
    }

    const updatedState = { ...state };
    updatedState.passengers = updatedState.passengers.filter(p => p.sn !== sn);

    // Decrement booked seats count
    updatedState.trips = updatedState.trips.map(t => {
      if (t.tripId === selectedTripId) {
        return { ...t, bookedSeats: Math.max(0, t.bookedSeats - 1) };
      }
      return t;
    });

    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Cancel Booking",
      details: `Cancelled booking for passenger ${passengerName} (${ticketNo}).`
    });

    onUpdateState(updatedState);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {showSuccessToast && (
        <div className="fixed top-24 right-8 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Booking & Ticketing Center</h2>
        <p className="text-xs text-slate-500">Reserve customer seats, process ticketing balances, and generate printable boarding passes</p>
      </div>

      {/* Two Columns: Booking Form and Seat Map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Form: Booking inputs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-800">Passenger Reservation Form</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Please fill out passenger and billing details</p>
          </div>

          <form onSubmit={handleBookSeat} className="space-y-4">
            {/* Trip Selection dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Select Active Schedule</label>
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  setSeatNo(""); // Reset seat selection when trip changes
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {state.trips.map(trip => (
                  <option key={trip.tripId} value={trip.tripId}>
                    {trip.tripId} — {trip.routeFrom} to {trip.routeTo} ({trip.departureTime})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mustafe Yuusuf"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Phone Line</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0912345678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Allocated Seat</label>
                <input
                  type="text"
                  value={seatNo ? `Seat ${seatNo}` : "Click grid seat →"}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-purple-800 text-center cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 block">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                >
                  <option value="Telebirr">Telebirr</option>
                  <option value="CBE Birr">CBE Birr</option>
                  <option value="Cash">Cash</option>
                  <option value="HelloCash">HelloCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Payment Status</label>
              <div className="flex gap-2">
                {["Paid", "Pending", "Cancelled"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPaymentStatus(status as Passenger["paymentStatus"])}
                    className={`flex-1 text-center py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      paymentStatus === status
                        ? status === "Paid" ? "bg-emerald-600 text-white" : status === "Pending" ? "bg-amber-500 text-white" : "bg-rose-600 text-white"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer pt-3 mt-4"
            >
              Confirm Reservation & Issue Ticket
            </button>
          </form>
        </div>

        {/* Right Section: Visual Seat map and Passengers currently on Trip */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm xl:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 font-sans">Live Interactive Coach Seat Map</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bus: <span className="font-extrabold text-slate-700">{activeTrip?.busNo}</span> • Select open seats to assign during checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Coach Layout */}
            <div className="lg:col-span-6">
              <SeatMap
                busNo={activeTrip?.busNo || "Express"}
                routeTo={activeTrip?.routeTo || "Wajaale"}
                tripPassengers={tripPassengers}
                selectedSeatNo={seatNo}
                onSelectSeat={(num) => setSeatNo(num)}
              />
            </div>

            {/* passengers list for chosen trip */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Trip Manifesto Checklist</span>
                <p className="text-xs font-bold text-slate-800">
                  Currently <span className="text-purple-700 font-extrabold">{tripPassengers.length} seats reserved</span> for {activeTrip?.routeFrom} → {activeTrip?.routeTo}.
                </p>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
                {tripPassengers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No passengers booked on this schedule yet.
                  </div>
                ) : (
                  tripPassengers.map(p => (
                    <div
                      key={p.sn}
                      className="bg-white border border-slate-150 hover:border-slate-250 p-4 rounded-xl flex items-center justify-between transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-black flex items-center justify-center font-mono">
                            {p.seatNo}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 font-mono">
                          <span>{p.phone}</span>
                          <span>•</span>
                          <span className="text-purple-600">{p.ticketNo}</span>
                          <span>•</span>
                          <span className={`uppercase text-[9px] font-black ${
                            p.paymentStatus === "Paid" ? "text-emerald-600 bg-emerald-50 px-1 rounded-sm" : "text-amber-600 bg-amber-50 px-1 rounded-sm"
                          }`}>{p.paymentStatus}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTicket(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          title="Generate Ticket"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(p.sn, p.name, p.ticketNo)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Boarding Pass Ticket modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <span className="font-black text-slate-800 text-sm">Official Passenger Ticket Boarding Pass</span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Boarding Pass Ticket Layout with Tear-Off Stubs */}
            <div className="p-8">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                
                {/* Branding row */}
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-dashed border-slate-700">
                  <div className="flex items-center gap-2.5">
                    {/* Circle badge */}
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">BK</div>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-black tracking-tight">BARAKO</span>
                      <span className="text-[8px] font-bold text-indigo-300 uppercase mt-0.5">Transportation & Logistics</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full uppercase">
                    E-TICKET BOARDING PASS
                  </span>
                </div>

                {/* Ticket Body details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    {/* Line 1: Name & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">PASSENGER NAME</span>
                        <p className="text-xs font-black text-slate-800 truncate">{selectedTicket.name}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">PHONE LINE</span>
                        <p className="text-xs font-bold text-slate-700 truncate font-mono">{selectedTicket.phone}</p>
                      </div>
                    </div>

                    {/* Line 2: Origin & Destination */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">ORIGIN HUB</span>
                        <p className="text-xs font-black text-slate-800">Jigjiga</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">DESTINATION STATION</span>
                        <p className="text-xs font-black text-indigo-900">{selectedTicket.destination}</p>
                      </div>
                    </div>

                    {/* Line 3: Bus & Seat */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">COACH NUMBER</span>
                        <p className="text-xs font-black text-slate-800 font-mono">{selectedTicket.busNo}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">ALLOCATED SEAT</span>
                        <p className="text-xs font-black text-purple-800">SEAT {selectedTicket.seatNo}</p>
                      </div>
                    </div>

                    {/* Line 4: Departure time & Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">DEPARTURE DISPATCH</span>
                        <p className="text-xs font-black text-slate-800 font-mono">{selectedTicket.time}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400">PAYMENT RECEIPT</span>
                        <p className="text-xs font-bold text-slate-800">
                          {selectedTicket.paymentMethod} • <span className="font-extrabold text-emerald-600">{selectedTicket.paymentStatus}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side: QR Code vector */}
                  <div className="border-l border-dashed border-slate-200 pl-6 flex flex-col items-center justify-center space-y-3">
                    {/* Simulated SVG QR Code representation (crisp vector) */}
                    <div className="bg-white p-2.5 border border-slate-200 rounded-xl shadow-xs">
                      <svg width="85" height="85" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white" />
                        {/* QR Corners */}
                        <rect x="5" y="5" width="25" height="25" stroke="black" strokeWidth="6" fill="transparent" />
                        <rect x="12" y="12" width="11" height="11" fill="black" />
                        <rect x="70" y="5" width="25" height="25" stroke="black" strokeWidth="6" fill="transparent" />
                        <rect x="77" y="12" width="11" height="11" fill="black" />
                        <rect x="5" y="70" width="25" height="25" stroke="black" strokeWidth="6" fill="transparent" />
                        <rect x="12" y="77" width="11" height="11" fill="black" />
                        {/* Random QR Grid pixels */}
                        <rect x="40" y="10" width="10" height="15" fill="black" />
                        <rect x="40" y="30" width="15" height="10" fill="black" />
                        <rect x="15" y="45" width="15" height="15" fill="black" />
                        <rect x="50" y="50" width="20" height="10" fill="black" />
                        <rect x="70" y="40" width="10" height="25" fill="black" />
                        <rect x="45" y="70" width="15" height="15" fill="black" />
                        <rect x="75" y="75" width="15" height="15" fill="black" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black font-mono text-slate-500 uppercase">
                      {selectedTicket.ticketNo}
                    </span>
                  </div>
                </div>

                {/* Circular punch-hole stubs for authentic airline style */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border border-slate-200 rounded-full" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full" />
              </div>

              {/* Printable Controls */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => alert(`Simulating receipt printer: Ticket ${selectedTicket.ticketNo} queued in thermal printer.`)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>
                <button
                  onClick={() => alert(`Saving pdf: BoardingPass_${selectedTicket.ticketNo}.pdf compiled and downloaded.`)}
                  className="flex-1 py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Boarding PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
