import React, { useState } from "react";
import {
  CalendarDays,
  Users,
  AlertOctagon,
  Coins,
  Bus,
  ChevronRight,
  Eye,
  Plus,
  Send,
  UploadCloud,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import { ERPState } from "../types";

interface DashboardViewProps {
  state: ERPState;
  onNavigateToTab: (tab: string) => void;
  onOpenManifestScanner: () => void;
  onOpenAddTrip: () => void;
  onOpenAddBooking: () => void;
}

export default function DashboardView({
  state,
  onNavigateToTab,
  onOpenManifestScanner,
  onOpenAddTrip,
  onOpenAddBooking
}: DashboardViewProps) {
  const [copiedText, setCopiedText] = useState("");

  // Calculate dynamic stats
  const totalTrips = state.trips.length;
  const totalPassengers = state.passengers.length;
  const missingPassengers = state.passengers.filter(p => p.attendance === "Absent").length;
  const pendingPassengers = state.passengers.filter(p => p.attendance === "Pending").length;
  const presentPassengers = state.passengers.filter(p => p.attendance === "Present").length;
  
  // Revenue calculation: Passengers ticket price + Cargo prices
  const ticketRevenue = state.passengers
    .filter(p => p.paymentStatus === "Paid")
    .reduce((sum, p) => {
      // Find matching trip price or fallback to 450
      const trip = state.trips.find(t => t.busNo === p.busNo || t.routeTo === p.destination);
      return sum + (trip ? trip.price : 450);
    }, 0);
  
  const cargoRevenue = state.cargo.reduce((sum, c) => sum + c.price, 0);
  const totalRevenue = ticketRevenue + cargoRevenue;

  const availableBuses = state.buses.filter(b => b.status === "Active").length;

  // Donut chart calculations
  const totalChecked = presentPassengers + missingPassengers + pendingPassengers;
  const presentPct = totalChecked > 0 ? Math.round((presentPassengers / totalChecked) * 100) : 0;
  const absentPct = totalChecked > 0 ? Math.round((missingPassengers / totalChecked) * 100) : 0;
  const pendingPct = totalChecked > 0 ? Math.round((pendingPassengers / totalChecked) * 100) : 0;

  // Dynamic values for SVG circles
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetPresent = circumference - (presentPct / 100) * circumference;
  const strokeDashoffsetAbsent = circumference - (absentPct / 100) * circumference;
  const strokeDashoffsetPending = circumference - (pendingPct / 100) * circumference;

  const quickAlert = (msg: string) => {
    setCopiedText(msg);
    setTimeout(() => setCopiedText(""), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Dynamic Toast feedback */}
      {copiedText && (
        <div className="fixed top-24 right-8 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 border border-slate-700 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{copiedText}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Today's Trips */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">Today's Trips</span>
            <span className="text-3xl font-black text-slate-800">{totalTrips}</span>
            <span className="text-[10px] font-bold text-emerald-600 block bg-emerald-50 px-1.5 py-0.5 rounded-full self-start leading-none mt-1">
              +20% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* Total Passengers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">Passengers Today</span>
            <span className="text-3xl font-black text-slate-800">{totalPassengers}</span>
            <span className="text-[10px] font-bold text-emerald-600 block bg-emerald-50 px-1.5 py-0.5 rounded-full self-start leading-none mt-1">
              +15% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Missing Passengers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">Missing Passengers</span>
            <span className="text-3xl font-black text-slate-800">{missingPassengers}</span>
            <span className="text-[10px] font-bold text-rose-600 block bg-rose-50 px-1.5 py-0.5 rounded-full self-start leading-none mt-1">
              -10% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">Today's Revenue</span>
            <span className="text-xl font-black text-slate-800">
              {totalRevenue.toLocaleString("en-US")} ETB
            </span>
            <span className="text-[10px] font-bold text-emerald-600 block bg-emerald-50 px-1.5 py-0.5 rounded-full self-start leading-none mt-1">
              +25% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Available Buses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block">Available Buses</span>
            <span className="text-3xl font-black text-slate-800">{availableBuses}</span>
            <span className="text-[10px] font-bold text-slate-500 block bg-slate-50 px-1.5 py-0.5 rounded-full self-start leading-none mt-1">
              Active fleet stable
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Trips Table Box */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-slate-800">Today's Active Trips</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Live departure and passenger check-in roster</p>
              </div>
              <button
                onClick={() => onNavigateToTab("trips")}
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Trips</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black tracking-widest uppercase text-slate-400">
                    <th className="pb-3 font-extrabold">Trip ID</th>
                    <th className="pb-3 font-extrabold">Route</th>
                    <th className="pb-3 font-extrabold">Bus / Driver</th>
                    <th className="pb-3 font-extrabold">Departure</th>
                    <th className="pb-3 font-extrabold">Booked</th>
                    <th className="pb-3 font-extrabold text-center">Status</th>
                    <th className="pb-3 font-extrabold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {state.trips.slice(0, 5).map((trip) => {
                    // Count passengers booked for this route or bus
                    const passengersOnTrip = state.passengers.filter(
                      p => p.destination === trip.routeTo && p.busNo === trip.busNo
                    );
                    const actualBookings = passengersOnTrip.length;

                    return (
                      <tr key={trip.tripId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3.5 font-bold text-slate-900">{trip.tripId}</td>
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900">{trip.routeFrom}</span>
                          <span className="text-slate-400 mx-1">→</span>
                          <span className="font-bold text-slate-900">{trip.routeTo}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900 block">{trip.busNo}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{trip.driverName}</span>
                        </td>
                        <td className="py-3.5 font-mono text-purple-800">{trip.departureTime}</td>
                        <td className="py-3.5 font-mono">
                          <span className="font-bold text-slate-900">{actualBookings}</span>
                          <span className="text-slate-400"> / {trip.capacity}</span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            trip.status === "ON TIME" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            trip.status === "DELAYED" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            trip.status === "DEPARTED" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                            "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => onNavigateToTab("attendant")}
                            title="Open Attendant Board"
                            className="p-1.5 bg-slate-100 group-hover:bg-purple-100 group-hover:text-purple-700 text-slate-500 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Visual card with logo */}
          <div className="bg-slate-50 rounded-2xl p-4 mt-4 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-indigo-100 rounded-lg text-indigo-700 font-black text-xs">BARAKO AI</span>
              <p className="text-[11px] text-slate-500 font-medium">
                Upload a scanned clipboard passenger sheet. Gemini will automatically parse it!
              </p>
            </div>
            <button
              onClick={onOpenManifestScanner}
              className="px-3.5 py-1.5 bg-purple-900 text-white hover:bg-purple-950 text-[10px] font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Scan Manifest</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Attendance Summary Donut & Quick Commands */}
        <div className="space-y-8">
          {/* Attendance Donut Widget */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="text-sm font-black text-slate-800">Attendance Summary (All Trips)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time breakdown of passenger arrivals</p>
            </div>

            {/* Clean responsive SVG Donut */}
            <div className="flex items-center justify-around gap-4 py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background track */}
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  
                  {/* Pending arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#94a3b8"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetPending}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  
                  {/* Absent arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetAbsent}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* Present arc */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffsetPresent}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                {/* Center total counter */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800 leading-none">{totalChecked}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Total booked</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
                  <div className="text-xs">
                    <span className="font-extrabold text-slate-800">{presentPct}%</span>
                    <span className="text-slate-400 ml-1">Present</span>
                    <span className="text-[10px] text-slate-400 block font-bold">({presentPassengers} pax)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-xs" />
                  <div className="text-xs">
                    <span className="font-extrabold text-slate-800">{absentPct}%</span>
                    <span className="text-slate-400 ml-1">Absent</span>
                    <span className="text-[10px] text-slate-400 block font-bold">({missingPassengers} pax)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-400 rounded-xs" />
                  <div className="text-xs">
                    <span className="font-extrabold text-slate-800">{pendingPct}%</span>
                    <span className="text-slate-400 ml-1">Pending</span>
                    <span className="text-[10px] text-slate-400 block font-bold">({pendingPassengers} pax)</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab("register")}
              className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Print Attendance Manifest Register
            </button>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6">
            <h3 className="text-sm font-black text-slate-800 mb-4">Quick Command Panel</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onOpenAddTrip}
                className="p-3 bg-purple-50/60 hover:bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-purple-950 transition-colors group cursor-pointer"
              >
                <Plus className="w-5 h-5 text-purple-700 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">New Trip</span>
              </button>

              <button
                onClick={onOpenAddBooking}
                className="p-3 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-emerald-950 transition-colors group cursor-pointer"
              >
                <Plus className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">Book Seat</span>
              </button>

              <button
                onClick={() => onNavigateToTab("buses")}
                className="p-3 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-indigo-950 transition-colors group cursor-pointer"
              >
                <Bus className="w-5 h-5 text-indigo-700 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">Add Bus</span>
              </button>

              <button
                onClick={() => {
                  quickAlert("Simulating broadcast: CBE Birr/Telebirr SMS reminder notifications sent to 12 missing passengers!");
                }}
                className="p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-amber-950 transition-colors group cursor-pointer"
              >
                <Send className="w-5 h-5 text-amber-700 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">SMS Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
