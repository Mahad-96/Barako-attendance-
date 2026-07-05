import React, { useState } from "react";
import {
  ClipboardList,
  Search,
  Phone,
  UserCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Printer,
  FileSpreadsheet,
  FileDown,
  UploadCloud,
  CheckCircle,
  HelpCircle,
  X,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Passenger, ERPState, Trip } from "../types";

interface AttendantViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
  onOpenManifestScanner: () => void;
}

export default function AttendantView({ state, onUpdateState, onOpenManifestScanner }: AttendantViewProps) {
  const [selectedTripId, setSelectedTripId] = useState(state.trips[0]?.tripId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDestination, setFilterDestination] = useState("All");

  // Call simulator state
  const [activeCall, setActiveCall] = useState<Passenger | null>(null);
  const [callState, setCallState] = useState<"Ringing" | "Connected" | "Ended">("Ringing");
  const [callTranscript, setCallTranscript] = useState<string[]>([]);
  const [speakerOn, setSpeakerOn] = useState(true);

  // Departure Lock State
  const [departureFeedback, setDepartureFeedback] = useState("");
  const [showPasscodeCheck, setShowPasscodeCheck] = useState(false);
  const [passcode, setPasscode] = useState("");

  const activeTrip = state.trips.find(t => t.tripId === selectedTripId) || state.trips[0];

  // Filter passengers based on active trip and inputs
  const tripPassengers = state.passengers.filter(p => {
    const matchesTrip = p.destination === activeTrip?.routeTo && p.busNo === activeTrip?.busNo;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery);
    const matchesDest = filterDestination === "All" || p.destination === filterDestination;

    return matchesTrip && matchesSearch && matchesDest;
  });

  // Calculate stats for current trip
  const totalBooked = tripPassengers.length;
  const presentCount = tripPassengers.filter(p => p.attendance === "Present").length;
  const absentCount = tripPassengers.filter(p => p.attendance === "Absent").length;
  const pendingCount = tripPassengers.filter(p => p.attendance === "Pending").length;

  // Toggle passenger attendance
  const handleToggleAttendance = (sn: number, status: Passenger["attendance"]) => {
    const updatedState = { ...state };
    updatedState.passengers = updatedState.passengers.map(p => {
      if (p.sn === sn) {
        return { ...p, attendance: status };
      }
      return p;
    });

    onUpdateState(updatedState);
  };

  const handleCheckAll = () => {
    const updatedState = { ...state };
    updatedState.passengers = updatedState.passengers.map(p => {
      const matchesTrip = p.destination === activeTrip?.routeTo && p.busNo === activeTrip?.busNo;
      if (matchesTrip) {
        return { ...p, attendance: "Present" };
      }
      return p;
    });
    onUpdateState(updatedState);
  };

  const handleUncheckAll = () => {
    const updatedState = { ...state };
    updatedState.passengers = updatedState.passengers.map(p => {
      const matchesTrip = p.destination === activeTrip?.routeTo && p.busNo === activeTrip?.busNo;
      if (matchesTrip) {
        return { ...p, attendance: "Pending" };
      }
      return p;
    });
    onUpdateState(updatedState);
  };

  // Simulated Telephone Call Dialog Box (Feature 2)
  const triggerPhoneCall = (passenger: Passenger) => {
    setActiveCall(passenger);
    setCallState("Ringing");
    setCallTranscript([`Dialing ${passenger.phone}...`]);

    // Ringing for 2 seconds then connected
    setTimeout(() => {
      setCallState("Connected");
      setCallTranscript(prev => [
        ...prev,
        "🔊 Ringing... Ringing...",
        `📞 Call Connected with ${passenger.name}!`,
        `Customer Attendant: "Abaal barako, hello ${passenger.name}? The coach for ${passenger.destination} is departing in 10 minutes!"`
      ]);

      // Passenger response
      setTimeout(() => {
        const responseOptions = [
          `Passenger ${passenger.name}: "Yes! Hello! I am so sorry. I am stuck on the road near the central market, but I am running now! Please hold the bus for 3 minutes, I am very close!"`,
          `Passenger ${passenger.name}: "Hello, yes! I am actually already at the gate terminal, I am purchasing a bottle of water and walking to the bus door right now."`,
          `Passenger ${passenger.name}: "Oh, hello. I have an emergency at home and unfortunately I cannot make the trip today. Please release my seat."`
        ];
        const chosenResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

        setCallTranscript(prev => [
          ...prev,
          chosenResponse,
          `Customer Attendant: "Understood. Thank you for notifying us. Please complete check-in immediately."`
        ]);
      }, 2500);

    }, 2000);
  };

  const endCall = () => {
    setCallState("Ended");
    setTimeout(() => {
      setActiveCall(null);
      setCallTranscript([]);
    }, 500);
  };

  // Bus Departure Control Mechanism (Feature 3)
  const handleDepartBus = () => {
    if (pendingCount > 0 || absentCount > 0) {
      setDepartureFeedback(
        `🚨 DEPARTURE LOCKED! ${absentCount + pendingCount} passengers are still missing. Admin Authorization or manual override required to depart BJ-21.`
      );
      return;
    }

    // Process departure
    executeDeparture();
  };

  const handlePasscodeOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" || passcode === "admin") {
      setShowPasscodeCheck(false);
      setPasscode("");
      setDepartureFeedback("");
      executeDeparture(true);
    } else {
      alert("Invalid administrator override code. Access Denied.");
    }
  };

  const executeDeparture = (overridden = false) => {
    const updatedState = { ...state };
    updatedState.trips = updatedState.trips.map(t => {
      if (t.tripId === selectedTripId) {
        return {
          ...t,
          status: "DEPARTED",
          attendanceLocked: true,
          attendanceOverridden: overridden
        };
      }
      return t;
    });

    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: "Ahmed Ali (Admin)",
      action: "Bus Departed",
      details: overridden
        ? `Authorized ADMIN OVERRIDE to depart bus coach ${activeTrip.busNo} to ${activeTrip.routeTo} with ${absentCount} passengers absent.`
        : `Successfully verified attendance manifest and dispatched coach ${activeTrip.busNo} to ${activeTrip.routeTo}.`
    });

    onUpdateState(updatedState);
    alert(overridden ? "Bus Departed via Admin Override!" : "Bus successfully departed!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-700" />
            <span>Customer Attendant Roster Check-In Board</span>
          </h2>
          <p className="text-xs text-slate-500">
            Verify passenger arrivals before bus departure. Bus dispatcher controls require 100% check-ins or Admin overrides.
          </p>
        </div>

        {/* Gemini handwritten manifest scanner integration */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenManifestScanner}
            className="px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-800 text-white hover:brightness-110 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer self-start border border-purple-500/20"
          >
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>Scan Clipboard Register (AI)</span>
          </button>
        </div>
      </div>

      {/* Roster Controls & Filters bar */}
      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Active Trip Selector */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Select Trip Schedule</span>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {state.trips.map(trip => (
                <option key={trip.tripId} value={trip.tripId}>
                  {trip.tripId} — {trip.routeFrom} to {trip.routeTo} ({trip.busNo})
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="space-y-0.5 w-full sm:w-60">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Search Passengers</span>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none ml-2 text-slate-700 placeholder-slate-400 w-full font-bold"
              />
            </div>
          </div>
        </div>

        {/* Global checkmarks */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckAll}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={handleUncheckAll}
            className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Reset All Pending
          </button>
        </div>
      </div>

      {/* Roster Layout Sheet */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Digital Clipboard Paper Table */}
        <div className="bg-white border border-slate-150 rounded-3xl shadow-sm xl:col-span-2 overflow-hidden border-t-4 border-t-purple-800">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-150 flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-purple-700" />
              <span>Digital Manifest Register Sheet</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Today: {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-150 text-[10px] font-black tracking-widest uppercase text-slate-400">
                  <th className="py-3 px-4 font-extrabold text-center">S/N</th>
                  <th className="py-3 px-4 font-extrabold">Passenger Name</th>
                  <th className="py-3 px-4 font-extrabold">Phone Number</th>
                  <th className="py-3 px-4 font-extrabold text-center">Seat No</th>
                  <th className="py-3 px-4 font-extrabold">Departure</th>
                  <th className="py-3 px-4 font-extrabold">Destination</th>
                  <th className="py-3 px-4 font-extrabold text-center">Attendance Checklist</th>
                  <th className="py-3 px-4 font-extrabold text-right">Call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                {tripPassengers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 text-xs font-medium">
                      No passengers registered on this trip. Schedule bookings first.
                    </td>
                  </tr>
                ) : (
                  tripPassengers.map((p, idx) => (
                    <tr key={p.sn} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-800 block">{p.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">{p.ticketNo}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{p.phone}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-black rounded-md font-mono text-[10px]">
                          {p.seatNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{p.time}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{p.destination}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present checkbox */}
                          <button
                            onClick={() => handleToggleAttendance(p.sn, "Present")}
                            className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider border cursor-pointer transition-all ${
                              p.attendance === "Present"
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Present
                          </button>

                          {/* Absent checkbox */}
                          <button
                            onClick={() => handleToggleAttendance(p.sn, "Absent")}
                            className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider border cursor-pointer transition-all ${
                              p.attendance === "Absent"
                                ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Absent
                          </button>

                          {/* Pending checkbox */}
                          <button
                            onClick={() => handleToggleAttendance(p.sn, "Pending")}
                            className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider border cursor-pointer transition-all ${
                              p.attendance === "Pending"
                                ? "bg-slate-400 text-white border-slate-500 shadow-sm"
                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Pending
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.attendance !== "Present" ? (
                          <button
                            onClick={() => triggerPhoneCall(p)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center ml-auto"
                            title="Call Missing Passenger"
                          >
                            <Phone className="w-3.5 h-3.5 animate-bounce" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-extrabold block mr-1">checked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table summary actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 text-xs font-bold text-slate-500">
              <span>Present: <span className="text-emerald-600 font-extrabold font-mono">{presentCount}</span></span>
              <span>Absent: <span className="text-rose-600 font-extrabold font-mono">{absentCount}</span></span>
              <span>Pending: <span className="text-slate-500 font-extrabold font-mono">{pendingCount}</span></span>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={() => alert("Simulating document generation: Excel roster register sheet exported.")}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => alert("Simulating PDF generation: PDF roster register sheet exported.")}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => alert("Roster manifest queued in terminal slip receipt printer.")}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print register</span>
              </button>
            </div>
          </div>
        </div>

        {/* Departure Control & Overrides Lock center */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-800">Bus Dispatch Control Center</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Authorize final coach departure log</p>
            </div>

            {/* Coach overview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Scheduled Coach:</span>
                <span className="text-slate-800">{activeTrip?.busNo}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Assigned Driver:</span>
                <span className="text-slate-800">{activeTrip?.driverName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Destination:</span>
                <span className="text-indigo-900">{activeTrip?.routeTo}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Trip Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  activeTrip?.status === "DEPARTED" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-700"
                }`}>
                  {activeTrip?.status}
                </span>
              </div>
            </div>

            {/* Warning Lock */}
            {activeTrip?.status !== "DEPARTED" ? (
              <div className="space-y-4">
                {departureFeedback && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs leading-relaxed font-semibold flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p>{departureFeedback}</p>
                      <button
                        type="button"
                        onClick={() => setShowPasscodeCheck(true)}
                        className="text-[10px] font-black uppercase text-purple-900 hover:underline mt-2 block cursor-pointer"
                      >
                        Click to authorize Admin Passcode Override
                      </button>
                    </div>
                  </div>
                )}

                {showPasscodeCheck ? (
                  <form onSubmit={handlePasscodeOverride} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fade-in">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Enter Admin Override Code</span>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Passcode is 1234"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 flex-1 focus:outline-none"
                        required
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-purple-900 hover:bg-purple-950 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer"
                      >
                        Override
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={handleDepartBus}
                    className="w-full py-3 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize Bus Departure</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-500" />
                <span>Coach Has Departed Station. Manifest Locked.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Interactive Phone Call Overlay (Feature 2) */}
      {activeCall && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col justify-between h-[480px] overflow-hidden relative">
            
            {/* Cellular signal & status */}
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 font-mono">
              <span>BARAKO-TELECOM 4G</span>
              <span>13:25</span>
              <span>100% [BAT]</span>
            </div>

            {/* Profile Avatar Caller info */}
            <div className="text-center space-y-3 mt-6">
              <div className="w-20 h-20 bg-purple-950 border-2 border-purple-500 rounded-full flex items-center justify-center font-bold text-xl text-purple-200 mx-auto animate-pulse shadow-lg">
                {activeCall.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-lg font-black">{activeCall.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeCall.phone}</p>
                <span className="text-[10px] text-purple-400 font-bold bg-purple-950/50 border border-purple-900 px-2 py-0.5 rounded-full mt-2 inline-block">
                  {callState === "Ringing" ? "Calling..." : "Call Active"}
                </span>
              </div>
            </div>

            {/* Call transcript dialog */}
            <div className="flex-1 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 overflow-y-auto mt-6 space-y-3 pr-2 scrollbar-none">
              {callTranscript.map((t, idx) => (
                <p key={idx} className="text-[11px] font-bold leading-relaxed text-slate-300">
                  {t}
                </p>
              ))}
            </div>

            {/* Control buttons */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-center text-xs font-bold">
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`p-3 rounded-full flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  speakerOn ? "bg-slate-800 text-white" : "bg-slate-950 text-slate-500"
                }`}
              >
                {speakerOn ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-[9px]">Speaker</span>
              </button>

              <button
                onClick={endCall}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer col-span-1 shadow-lg shadow-red-950/30"
              >
                <Phone className="w-5 h-5 rotate-135" />
                <span className="text-[9px] font-black">End Call</span>
              </button>

              <button
                className="p-3 bg-slate-800 text-slate-300 rounded-full flex flex-col items-center justify-center gap-1.5 transition-colors cursor-not-allowed"
                disabled
              >
                <Lock className="w-5 h-5 text-slate-500" />
                <span className="text-[9px]">Mute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
