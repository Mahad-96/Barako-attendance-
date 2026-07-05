import React, { useState } from "react";
import { Box, Plus, Search, Truck, CheckCircle2, ChevronRight, MapPin, BadgePercent, ShieldAlert, Trash2 } from "lucide-react";
import { Cargo, ERPState } from "../types";

interface CargoViewProps {
  state: ERPState;
  onUpdateState: (state: ERPState) => void;
}

export default function CargoView({ state, onUpdateState }: CargoViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [origin, setOrigin] = useState("Jigjiga");
  const [destination, setDestination] = useState("Wajaale");
  const [weight, setWeight] = useState(10);
  const [type, setType] = useState("Box - Electronics");
  const [price, setPrice] = useState(300);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateCargo = (e: React.FormEvent) => {
    e.preventDefault();

    const trackingNo = `CRG-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCargo: Cargo = {
      trackingNo,
      sender,
      receiver,
      receiverPhone,
      origin,
      destination,
      weight,
      type,
      price,
      status: "Warehouse",
      date: new Date().toISOString().split("T")[0]
    };

    const updatedState = { ...state };
    updatedState.cargo.unshift(newCargo);

    // Append to audit logs
    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Cargo Ingestion",
      details: `Booked new cargo shipment ${trackingNo} from ${sender} to ${receiver} (${destination}).`
    });

    onUpdateState(updatedState);
    setShowAddForm(false);

    // Reset Form
    setSender("");
    setReceiver("");
    setReceiverPhone("");
    setWeight(10);
    setPrice(300);
  };

  const handleUpdateStatus = (trackingNo: string, newStatus: Cargo["status"]) => {
    const updatedState = { ...state };
    updatedState.cargo = updatedState.cargo.map(c => {
      if (c.trackingNo === trackingNo) {
        return { ...c, status: newStatus };
      }
      return c;
    });

    updatedState.auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: `${state.currentUser.name} (${state.currentUser.role})`,
      action: "Update Cargo Status",
      details: `Updated cargo ${trackingNo} status to ${newStatus}.`
    });

    onUpdateState(updatedState);
  };

  const handleDeleteCargo = (trackingNo: string) => {
    if (!window.confirm(`Are you sure you want to delete cargo ${trackingNo}?`)) return;

    const updatedState = { ...state };
    updatedState.cargo = updatedState.cargo.filter(c => c.trackingNo !== trackingNo);
    onUpdateState(updatedState);
  };

  const filteredCargo = state.cargo.filter(c => {
    return c.trackingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.receiver.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cargo & Parcel Logistics</h2>
          <p className="text-xs text-slate-500">Track and manage corporate goods and shipping schedules</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Book Cargo Shipment</span>
        </button>
      </div>

      {/* Booking Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Book New Cargo Parcel</span>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCargo} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Cargo Sender</label>
                  <input
                    type="text"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="Sender Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Cargo Receiver</label>
                  <input
                    type="text"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="Receiver Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Receiver Phone</label>
                  <input
                    type="text"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="e.g. 0912998811"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Package Type / Description</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Box - Electronics Spares"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Origin City</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {state.routes.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Destination City</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
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
                  <label className="text-[10px] font-black uppercase text-slate-400">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Shipping Price (ETB)</label>
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
                  Complete Cargo Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cargo List and Search toolbar */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full max-w-sm focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by tracking, sender, receiver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none ml-2 text-slate-700 placeholder-slate-400 w-full font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCargo.map((c) => (
            <div key={c.trackingNo} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-mono text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase border border-purple-100">
                  {c.trackingNo}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  c.status === "Warehouse" ? "bg-slate-200 text-slate-700" :
                  c.status === "In Transit" ? "bg-amber-100 text-amber-800" :
                  "bg-emerald-100 text-emerald-800"
                }`}>
                  {c.status}
                </span>
              </div>

              {/* Sender & Receiver Card details */}
              <div className="space-y-2 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Sender Info</span>
                  <p className="text-slate-800 font-bold">{c.sender}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Receiver Info</span>
                  <p className="text-slate-800 font-bold">{c.receiver}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.receiverPhone}</p>
                </div>
              </div>

              {/* Shipping Origin / Destination */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div className="text-[11px] font-bold text-slate-700">
                  <span>{c.origin}</span>
                  <span className="text-slate-400 mx-1.5">→</span>
                  <span>{c.destination}</span>
                </div>
              </div>

              {/* Weight, Price details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Type & Weight</span>
                  <p className="text-xs font-bold text-slate-700">{c.weight} kg • {c.type}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Shipping Price</span>
                  <p className="text-xs font-black text-slate-800">{c.price} ETB</p>
                </div>
              </div>

              {/* Status Update selectors */}
              <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between">
                <div className="flex gap-1">
                  {["Warehouse", "In Transit", "Delivered"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(c.trackingNo, st as Cargo["status"])}
                      className={`text-[9px] font-black px-1.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                        c.status === st
                          ? "bg-purple-900 text-white shadow-xs"
                          : "bg-white text-slate-500 hover:bg-slate-150 border border-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteCargo(c.trackingNo)}
                  className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
