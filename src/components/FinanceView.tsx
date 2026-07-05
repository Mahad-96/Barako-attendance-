import React, { useState } from "react";
import { CircleDollarSign, TrendingUp, History, ShieldAlert, FileText, Search } from "lucide-react";
import { ERPState } from "../types";

interface FinanceViewProps {
  state: ERPState;
}

export default function FinanceView({ state }: FinanceViewProps) {
  const [searchLog, setSearchLog] = useState("");

  // Calculate finance metrics
  const passengerRevenue = state.passengers.reduce((sum, p) => {
    // Lookup trip to find price
    const pTrip = state.trips.find(t => t.routeTo === p.destination && t.busNo === p.busNo);
    const fare = pTrip ? pTrip.price : 450;
    return sum + (p.paymentStatus === "Paid" ? fare : 0);
  }, 0);

  const cargoRevenue = state.cargo.reduce((sum, c) => sum + c.price, 0);
  const grossRevenue = passengerRevenue + cargoRevenue;

  // Revenue by method
  const revenueByMethod = state.passengers.reduce((acc: Record<string, number>, p) => {
    if (p.paymentStatus === "Paid") {
      const pTrip = state.trips.find(t => t.routeTo === p.destination && t.busNo === p.busNo);
      const fare = pTrip ? pTrip.price : 450;
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + fare;
    }
    return acc;
  }, {});

  const filteredLogs = state.auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.details.toLowerCase().includes(searchLog.toLowerCase()) ||
    log.user.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Financial Ledger & Audit Trail</h2>
        <p className="text-xs text-slate-500">Monitor cash flow balances, mobile billing methods, and system security transactions</p>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Total Passenger Fare Revenue</span>
            <p className="text-2xl font-black text-slate-800">{passengerRevenue.toLocaleString()} ETB</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Total Cargo Ingestion Revenue</span>
            <p className="text-2xl font-black text-slate-800">{cargoRevenue.toLocaleString()} ETB</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Combined Gross Earnings</span>
            <p className="text-2xl font-black text-purple-900">{grossRevenue.toLocaleString()} ETB</p>
          </div>
          <div className="w-12 h-12 bg-purple-900 text-white rounded-xl flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two columns: Revenue by method left, Security audit logs right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Billing Method distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6 h-fit">
          <div>
            <h3 className="text-sm font-black text-slate-800">Earnings by Payment Method</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time mobile merchant ledger summaries</p>
          </div>

          <div className="space-y-4">
            {["Telebirr", "CBE Birr", "Cash", "HelloCash"].map((method) => {
              const amount = revenueByMethod[method] || 0;
              const percentage = grossRevenue > 0 ? (amount / grossRevenue) * 100 : 0;

              return (
                <div key={method} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">{method}</span>
                    <span className="text-slate-800">{amount.toLocaleString()} ETB</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full ${
                        method === "Telebirr" ? "bg-purple-800" :
                        method === "CBE Birr" ? "bg-indigo-600" :
                        method === "Cash" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security logs list */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-700" />
                <span>Enterprise Security Audit Trail</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Immutable record of system state modifications</p>
            </div>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 w-full sm:w-64 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter logs by keywords..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none ml-2 text-slate-700 placeholder-slate-400 w-full font-medium"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                No logs found matching search filter.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex items-start gap-3 hover:border-slate-200 transition-colors">
                  <div className="w-8 h-8 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-black uppercase">
                    SYS
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-extrabold text-slate-800">{log.action}</span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{log.timestamp.replace("T", " ").substring(0, 19)}</span>
                      <span className="text-[10px] font-black text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded-sm font-mono">{log.user}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-semibold">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
