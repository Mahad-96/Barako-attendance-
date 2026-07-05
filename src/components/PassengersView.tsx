import React, { useState } from "react";
import { Search, Users, Eye, HelpCircle, User } from "lucide-react";
import { Passenger, ERPState } from "../types";

interface PassengersViewProps {
  state: ERPState;
}

export default function PassengersView({ state }: PassengersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDestination, setFilterDestination] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");

  // Filter passengers
  const filteredPassengers = state.passengers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery) || p.ticketNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDest = filterDestination === "All" || p.destination === filterDestination;
    const matchesPay = filterPayment === "All" || p.paymentStatus === filterPayment;

    return matchesSearch && matchesDest && matchesPay;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Passengers Directory</h2>
        <p className="text-xs text-slate-500">View and manage the comprehensive passenger ledger</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full md:w-80 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, phone, ticket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none ml-2 text-slate-700 placeholder-slate-400 w-full font-medium"
          />
        </div>

        {/* Filters dropdowns */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Destination:</span>
            <select
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Cities</option>
              {state.routes.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Billing:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Passengers Ledger Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/55 border-b border-slate-150 text-[10px] font-black tracking-widest uppercase text-slate-400">
                <th className="py-3.5 px-6 font-extrabold">S/N</th>
                <th className="py-3.5 px-6 font-extrabold">Passenger Name</th>
                <th className="py-3.5 px-6 font-extrabold">Phone Number</th>
                <th className="py-3.5 px-6 font-extrabold">Seat No</th>
                <th className="py-3.5 px-6 font-extrabold">Age/Gender</th>
                <th className="py-3.5 px-6 font-extrabold">Destination</th>
                <th className="py-3.5 px-6 font-extrabold">Ticket No</th>
                <th className="py-3.5 px-6 font-extrabold">Attendance</th>
                <th className="py-3.5 px-6 font-extrabold">Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredPassengers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400 text-xs font-medium">
                    No passenger records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPassengers.map((p, idx) => (
                  <tr key={p.sn} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center font-bold text-purple-700">
                          {p.name[0]}
                        </div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono">{p.phone}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-black rounded-md font-mono text-[10px]">
                        Seat {p.seatNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-slate-800">{p.gender}</span>
                      <span className="text-slate-400 text-[10px] ml-1 font-mono">({p.age}y)</span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{p.destination}</td>
                    <td className="py-3.5 px-6 font-mono text-purple-700 font-extrabold">{p.ticketNo}</td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        p.attendance === "Present" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        p.attendance === "Absent" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                        "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}>
                        {p.attendance}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        p.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
