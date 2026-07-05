import React, { useState } from "react";
import { Smartphone, CheckCircle, HelpCircle, User, Compass, Phone, ShieldCheck, Play, Key, Radio, AlertOctagon } from "lucide-react";
import { Passenger, ERPState, Trip } from "../types";

interface DriverPortalViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function DriverPortalView({ state, onUpdateState }: DriverPortalViewProps) {
  const [driverName, setDriverName] = useState("Abdi Hassan");
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Active Selected Trip for check-in
  const [selectedTripId, setSelectedTripId] = useState(state.trips[0]?.tripId || "");

  const activeTrip = state.trips.find(t => t.tripId === selectedTripId) || state.trips[0];

  // Find passenger passengers for this operator
  const tripPassengers = state.passengers.filter(
    p => p.destination === activeTrip?.routeTo && p.busNo === activeTrip?.busNo
  );

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "driver" || password === "1234") {
      setIsUnlocked(true);
      setPassword("");
    } else {
      alert("Invalid Driver credentials PIN. Try: driver");
    }
  };

  const handleToggleAttendance = (sn: number, current: Passenger["attendance"]) => {
    const nextStatus: Passenger["attendance"] = current === "Present" ? "Absent" : current === "Absent" ? "Pending" : "Present";
    
    const updatedState = { ...state };
    updatedState.passengers = updatedState.passengers.map(p => {
      if (p.sn === sn) {
        return { ...p, attendance: nextStatus };
      }
      return p;
    });

    onUpdateState(updatedState);
  };

  const handleReportEmergency = () => {
    if (!window.confirm("CONFIRM BREAKDOWN DISPATCH? This will flag system-wide controllers immediately and notify reserve buses.")) {
      return;
    }

    const updatedState = { ...state };
    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${driverName} (Driver)`,
      action: "Emergency Breakdown Alert",
      details: `ROAD EMERGENCY ALARM: Operator ${driverName} reported mechanical breakdown for bus ${activeTrip.busNo} on route ${activeTrip.routeFrom} → ${activeTrip.routeTo}.`
    });

    onUpdateState(updatedState);
    alert("Emergency SOS sent! Reserve coaches and mechanics dispatched to your GPS location.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Operator Mobile Smartphone Portal</h2>
        <p className="text-xs text-slate-500">Stunning on-screen smartphone device mock simulating field operations</p>
      </div>

      {/* Grid: Instructions left, Smartphone mock right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Help Description panel */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-black text-purple-900 uppercase">Field Simulation Guide</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We have compiled a fully interactive mobile interface mock frame representing the Driver's smartphone.
            </p>
          </div>

          <div className="space-y-3.5 text-xs font-semibold text-slate-600">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-purple-600 shrink-0" />
              <p>
                <strong>Security Lockscreen</strong>: Choose the driver name (e.g. <em>Abdi Hassan</em>) and login with PIN code: <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded-md font-black font-mono">driver</span>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <p>
                <strong>Smartphone Sync</strong>: Change passenger statuses inside the virtual phone screen. Observe that the changes sync instantly across other workspace dashboards!
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <p>
                <strong>Emergency SOS</strong>: Tap the emergency button on the mobile screen to simulate direct highway breakdown dispatches.
              </p>
            </div>
          </div>
        </div>

        {/* Smartphone Frame mock container */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-[325px] h-[640px] bg-slate-950 rounded-[48px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-between p-4">
            
            {/* Speaker & camera Notch bar */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-b-xl flex items-center justify-center z-50">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Simulated status bar row */}
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 font-mono pt-3 relative z-40 px-3">
              <span>08:45 AM</span>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-500 animate-ping" />
                <span>BK-NET</span>
                <span>99%</span>
              </div>
            </div>

            {/* Dynamic Screen Area */}
            <div className="flex-1 bg-slate-900 text-white rounded-3xl mt-4 mb-2 p-4 overflow-y-auto relative z-30 flex flex-col justify-between scrollbar-none">
              
              {!isUnlocked ? (
                /* Driver Lockscreen Form */
                <form onSubmit={handleUnlock} className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-purple-950/80 border border-purple-500 text-purple-200 rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                      <User className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-black tracking-tight">Driver Lockscreen</h4>
                    <p className="text-[10px] text-slate-400">Barako Driver Identity Portal</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">Driver Account</label>
                      <select
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        {state.drivers.map(d => (
                          <option key={d.name} value={d.name} className="bg-slate-900">{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400">PIN CODE</label>
                      <input
                        type="password"
                        placeholder="PIN is driver"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none placeholder-slate-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      Authenticate Security PIN
                    </button>
                  </div>
                </form>
              ) : (
                /* Driver Logged-In Screen */
                <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                  {/* Greeting header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[9px] font-black uppercase text-purple-400">Logged Operator</span>
                      <h4 className="text-xs font-extrabold truncate max-w-[140px]">{driverName}</h4>
                    </div>
                    <button
                      onClick={() => setIsUnlocked(false)}
                      className="text-[9px] font-black text-slate-400 bg-slate-800 px-2 py-1 rounded-lg hover:bg-slate-750 cursor-pointer"
                    >
                      Lock
                    </button>
                  </div>

                  {/* Trip Selector dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 block">Active Dispatch</label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold text-white focus:outline-none"
                    >
                      {state.trips.map(trip => (
                        <option key={trip.tripId} value={trip.tripId} className="bg-slate-900">
                          {trip.tripId} — {trip.routeTo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Passenger Attendance Checklist scroll section */}
                  <div className="flex-1 space-y-3 min-h-[180px] overflow-y-auto scrollbar-none py-1">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <span>Roster (Tap to Check)</span>
                      <span>{tripPassengers.filter(p => p.attendance === "Present").length} / {tripPassengers.length}</span>
                    </div>

                    {tripPassengers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-[10px]">
                        No passengers booked for this active run.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tripPassengers.map(p => (
                          <div
                            key={p.sn}
                            onClick={() => handleToggleAttendance(p.sn, p.attendance)}
                            className="bg-slate-800 border border-slate-700/60 p-2.5 rounded-xl flex items-center justify-between hover:border-purple-500 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-slate-200 truncate">{p.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 font-mono">Seat {p.seatNo} • {p.phone}</p>
                            </div>

                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                              p.attendance === "Present" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                              p.attendance === "Absent" ? "bg-rose-950 text-rose-400 border border-rose-800" :
                              "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}>
                              {p.attendance}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* EMERGENCY RED PANIC BUTTON */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[8px] font-black uppercase text-slate-500 block text-center">Highway Assistance</span>
                    <button
                      onClick={handleReportEmergency}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                    >
                      <AlertOctagon className="w-4 h-4 animate-bounce" />
                      <span>SOS BREAKDOWN REPORT</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Simulated smartphone center button */}
            <div className="w-10 h-10 rounded-full border-2 border-slate-800 mx-auto flex items-center justify-center cursor-pointer mt-1 hover:border-slate-600 transition-colors">
              <div className="w-3.5 h-3.5 rounded-xs bg-slate-800" />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
