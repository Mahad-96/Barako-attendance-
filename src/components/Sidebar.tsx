import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookmarkCheck,
  Users,
  Box,
  Bus,
  UserCheck,
  Compass,
  ClipboardList,
  Contact,
  CreditCard,
  FileBarChart2,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import Logo from "./Logo";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setTab, onLogout }: SidebarProps) {
  const menuGroups = [
    {
      title: "Core Operations",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "trips", label: "Trips Management", icon: CalendarDays },
        { id: "bookings", label: "Bookings & Tickets", icon: BookmarkCheck },
        { id: "passengers", label: "Passengers List", icon: Users },
        { id: "cargo", label: "Cargo Logistics", icon: Box },
      ]
    },
    {
      title: "Fleet & Personnel",
      items: [
        { id: "buses", label: "Buses Management", icon: Bus },
        { id: "drivers", label: "Drivers Directory", icon: Contact },
        { id: "routes", label: "Routes & Hubs", icon: Compass },
        { id: "attendant", label: "Customer Attendant", icon: UserCheck, tag: "Interactive" },
        { id: "register", label: "Attendance Sheet", icon: ClipboardList },
      ]
    },
    {
      title: "Financials & Logs",
      items: [
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "reports", label: "Business Reports", icon: FileBarChart2 },
        { id: "logs", label: "Audit Logs", icon: ShieldAlert },
      ]
    }
  ];

  return (
    <aside className="w-80 bg-slate-900 text-slate-300 h-screen flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl relative z-40">
      {/* Sidebar Logo Header */}
      <div className="h-20 flex items-center justify-center px-6 border-b border-slate-800 bg-slate-950/60">
        <Logo size="md" className="brightness-110" />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-4 block">
              {group.title}
            </span>

            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-950/40 transform scale-[1.02]"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.tag && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase scale-90 ${
                          isActive ? "bg-white text-purple-900" : "bg-purple-950 text-purple-400 border border-purple-800/30"
                        }`}>
                          {item.tag}
                        </span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "text-white rotate-90" : "text-slate-600"}`} />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Branding & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        {/* Dynamic Mobile View Toggle or Quick Driver view */}
        <button
          onClick={() => setTab("driver-portal")}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-xl text-xs font-bold border border-slate-700 transition-colors mb-4 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Simulate Driver Mobile</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-red-950/25 hover:text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span>Exit ERP Control Panel</span>
        </button>
        
        <p className="text-[10px] text-center text-slate-600 font-medium mt-3">
          BARAKO ERP v2.4.0 • Built for Cloud Run
        </p>
      </div>
    </aside>
  );
}
