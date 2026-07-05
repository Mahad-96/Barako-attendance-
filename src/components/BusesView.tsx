import React, { useState } from "react";
import { Plus, Bus, Settings, RefreshCw, AlertTriangle, ShieldCheck, Fuel } from "lucide-react";
import { Bus as BusType, ERPState } from "../types";

interface BusesViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function BusesView({ state, onUpdateState }: BusesViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [busNo, setBusNo] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [model, setModel] = useState("Yutong Coach F12+");
  const [capacity, setCapacity] = useState(40);
  const [driverName, setDriverName] = useState("None Assigned");
  const [fuelLevel, setFuelLevel] = useState(80);

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();

    const newBus: BusType = {
      busNo,
      plateNo,
      model,
      capacity,
      driverName,
      status: "Active",
      fuelLevel,
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };

    const updatedState = { ...state };
    updatedState.buses.push(newBus);

    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Add Bus",
      details: `Added new bus fleet ${busNo} (${model}).`
    });

    onUpdateState(updatedState);
    setShowAddForm(false);

    setBusNo("");
    setPlateNo("");
  };

  const handleUpdateStatus = (busNo: string, newStatus: BusType["status"]) => {
    const updatedState = { ...state };
    updatedState.buses = updatedState.buses.map(b => {
      if (b.busNo === busNo) {
        return { ...b, status: newStatus };
      }
      return b;
    });

    onUpdateState(updatedState);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Fleet Management</h2>
          <p className="text-xs text-slate-500">Monitor active bus coaches, fuel gauges, and maintenance reports</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {/* Add Bus Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Add New Coach Fleet</span>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Bus Identifier (e.g. BJ-55)</label>
                <input
                  type="text"
                  value={busNo}
                  onChange={(e) => setBusNo(e.target.value)}
                  placeholder="e.g. BJ-55"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">License Plate Tag</label>
                <input
                  type="text"
                  value={plateNo}
                  onChange={(e) => setPlateNo(e.target.value)}
                  placeholder="e.g. ET-3-B99231"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Model Manufacturer</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Total Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Assigned Driver</label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <option value="None Assigned">None Assigned</option>
                    {state.drivers.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Initial Fuel Level (%)</label>
                  <input
                    type="number"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
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
                  Confirm Fleet Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buses fleet listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {state.buses.map((bus) => (
          <div key={bus.busNo} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{bus.busNo}</h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider">{bus.plateNo}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                bus.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                bus.status === "Maintenance" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                "bg-rose-50 text-rose-700 border border-rose-100"
              }`}>
                {bus.status}
              </span>
            </div>

            {/* Coach specifications */}
            <div className="space-y-1 text-xs">
              <span className="text-[9px] font-black uppercase text-slate-400 block">Manufacturer / Chassis</span>
              <p className="font-bold text-slate-800">{bus.model}</p>
              <p className="text-slate-400">Certified seating limit: <span className="font-extrabold text-slate-700">{bus.capacity} seats</span></p>
            </div>

            {/* Fuel Gauge meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  <span>Fuel Gauge</span>
                </span>
                <span className={`font-mono ${bus.fuelLevel < 20 ? "text-rose-600 animate-pulse" : "text-slate-600"}`}>
                  {bus.fuelLevel}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${bus.fuelLevel}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    bus.fuelLevel < 25 ? "bg-rose-500" :
                    bus.fuelLevel < 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Assigned Driver & maintenance dates */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50 text-[11px] font-bold">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Assigned Operator</span>
                <span className="text-slate-700 truncate block">{bus.driverName}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Next Maintenance</span>
                <span className="text-slate-700 font-mono block">{bus.nextMaintenance}</span>
              </div>
            </div>

            {/* Operations override */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase">Set Status:</span>
              <div className="flex gap-1">
                {["Active", "Maintenance", "Fueling"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(bus.busNo, st as BusType["status"])}
                    className={`text-[9px] font-black px-1.5 py-1 rounded-md transition-all cursor-pointer ${
                      bus.status === st
                        ? "bg-purple-900 text-white shadow-xs"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
