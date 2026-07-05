import React, { useState, useEffect } from "react";
import { Search, Bell, Moon, Sun, Maximize, User, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { ERPState } from "../types";

interface HeaderProps {
  state: ERPState;
  onLogout: () => void;
  onViewAuditLogs: () => void;
}

export default function Header({ state, onLogout, onViewAuditLogs }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Mock Notifications for high interactivity
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Attendance Overridden",
      desc: "Trip TRP-001 (Wajaale) approved with 2 missing passengers.",
      time: "5 mins ago",
      type: "warning",
      read: false
    },
    {
      id: 2,
      title: "AI Ingestion Success",
      desc: "Successfully ingested 10 passengers from handmanifest photo.",
      time: "20 mins ago",
      type: "success",
      read: false
    },
    {
      id: 3,
      title: "Maintenance Alert",
      desc: "Bus BJ-19 fuel level critically low (12%). Scheduled for maintenance.",
      time: "1 hour ago",
      type: "alert",
      read: true
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  // Human date format
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  return (
    <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Welcome & Search */}
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Good Morning, {state.currentUser.name} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            ERP Control Panel — Barako Transportation & Logistics
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search bookings, buses, drivers..."
            className="bg-transparent border-none text-xs focus:outline-none ml-2 text-slate-700 placeholder-slate-400 w-full"
          />
        </div>
      </div>

      {/* Settings / Utilities */}
      <div className="flex items-center gap-6">
        {/* Live Date-Time Widget */}
        <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-6">
          <span className="text-xs font-bold text-slate-700">{formattedDate}</span>
          <span className="text-[10px] font-bold font-mono text-indigo-600 mt-0.5 tracking-wider">
            {formattedTime} (GMT+3)
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="font-bold text-slate-700 text-xs">Live Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-purple-700 font-bold hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex gap-3 ${
                      !n.read ? "bg-purple-50/20" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {n.type === "warning" && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                      {n.type === "alert" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold text-slate-800 ${!n.read ? "text-purple-950" : ""}`}>
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                      <span className="text-[9px] font-medium text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onViewAuditLogs();
                  }}
                  className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  View System Audit Logs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logged in User Profile Dropdown */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200 rounded-xl flex items-center justify-center shadow-inner font-bold text-purple-800">
            {state.currentUser.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-800">{state.currentUser.name}</span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full mt-0.5 self-start leading-none border border-purple-100">
              {state.currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
