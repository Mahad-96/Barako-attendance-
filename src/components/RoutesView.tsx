import React, { useState } from "react";
import { Compass, Plus, Search, MapPin, Map, ArrowRight } from "lucide-react";
import { ERPState } from "../types";

interface RoutesViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function RoutesView({ state, onUpdateState }: RoutesViewProps) {
  const [newRoute, setNewRoute] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoute.trim()) return;

    // Check duplication
    if (state.routes.some(r => r.toLowerCase() === newRoute.trim().toLowerCase())) {
      alert("This route already exists in the system.");
      return;
    }

    const updatedState = { ...state };
    updatedState.routes.push(newRoute.trim());

    // Audit log
    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Create Route",
      details: `Added new regional travel destination: ${newRoute.trim()}.`
    });

    onUpdateState(updatedState);
    setNewRoute("");
  };

  const filteredRoutes = state.routes.filter(r =>
    r.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Transport Hubs & Routes</h2>
        <p className="text-xs text-slate-500">Add, view, and organize regional terminal stops and ticket dispatches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <div>
            <h3 className="text-sm font-black text-slate-800">Register Regional Stop</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Define custom terminals to schedule dispatches</p>
          </div>

          <form onSubmit={handleAddRoute} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 block">Terminal City Name</label>
              <input
                type="text"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                placeholder="e.g. Qabridahar"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Add Stop Station
            </button>
          </form>
        </div>

        {/* Right List Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">Active Stop Stations Directory</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Currently serving {state.routes.length} hub terminals</p>
            </div>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 w-full sm:w-64 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter terminal list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none ml-2 text-slate-700 placeholder-slate-400 w-full font-medium"
              />
            </div>
          </div>

          {/* Grid of stop badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredRoutes.map((route, idx) => (
              <div
                key={route}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-purple-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">{route}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-extrabold group-hover:text-purple-600 transition-colors shrink-0 pl-1">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
