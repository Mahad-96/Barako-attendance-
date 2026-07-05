import React, { useState } from "react";
import { Plus, User, Star, Phone, ShieldCheck, Mail, Compass, Award } from "lucide-react";
import { Driver, ERPState } from "../types";

interface DriversViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function DriversView({ state, onUpdateState }: DriversViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [experience, setExperience] = useState("5 Years");
  const [assignedBus, setAssignedBus] = useState("None");
  const [assignedRoute, setAssignedRoute] = useState("Jigjiga → Wajaale");

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();

    const newDriver: Driver = {
      name,
      phone,
      licenseNo,
      experience,
      assignedBus,
      assignedRoute,
      availability: "Active",
      rating: 5.0
    };

    const updatedState = { ...state };
    updatedState.drivers.push(newDriver);

    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Add Driver",
      details: `Registered new operator/driver ${name} in system directories.`
    });

    onUpdateState(updatedState);
    setShowAddForm(false);

    setName("");
    setPhone("");
    setLicenseNo("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Drivers Registry</h2>
          <p className="text-xs text-slate-500">View and assign driver credentials, star ratings, and transport routes</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Driver</span>
        </button>
      </div>

      {/* Add Driver Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Register Transport Operator</span>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Driver Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abdi Hassan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Phone Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0911223344"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">License ID Number</label>
                <input
                  type="text"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="e.g. DL-ET98123A"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Experience Years</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 8 Years"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Assigned Bus</label>
                  <input
                    type="text"
                    value={assignedBus}
                    onChange={(e) => setAssignedBus(e.target.value)}
                    placeholder="e.g. BJ-21"
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
                  Confirm Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {state.drivers.map((driver) => (
          <div key={driver.name} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Operator background accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="flex items-start gap-4 relative z-10">
              {/* Operator Avatar */}
              <div className="w-12 h-12 bg-purple-100 text-purple-700 border border-purple-200 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                {driver.name.split(" ").map(n => n[0]).join("")}
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-slate-800 text-sm">{driver.name}</h3>
                
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span className="text-[11px] font-black text-slate-700">{driver.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">({driver.experience} Exp)</span>
                </div>
              </div>
            </div>

            {/* License details */}
            <div className="space-y-1 text-xs pt-2 border-t border-slate-50 relative z-10">
              <span className="text-[9px] font-black uppercase text-slate-400 block">Licensing Registry</span>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Award className="w-4 h-4 text-slate-400" />
                <span>{driver.licenseNo}</span>
              </div>
            </div>

            {/* Contacts & assigned route details */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-[11px] font-bold relative z-10">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block">Phone Contact</span>
                <div className="flex items-center gap-1 text-slate-700 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{driver.phone}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-slate-400 block">Assigned Bus</span>
                <div className="flex items-center gap-1 text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{driver.assignedBus}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Active Hub Dispatch</span>
              <span className="text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md block text-center">
                {driver.assignedRoute}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
