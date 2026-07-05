import React, { useState } from "react";
import { Passenger } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Armchair, Compass, HelpCircle, Info, RefreshCw, User } from "lucide-react";

interface SeatMapProps {
  busNo: string;
  routeTo: string;
  tripPassengers: Passenger[];
  selectedSeatNo?: number | "";
  onSelectSeat?: (seatNo: number) => void;
  readOnly?: boolean;
}

export default function SeatMap({
  busNo,
  routeTo,
  tripPassengers,
  selectedSeatNo,
  onSelectSeat,
  readOnly = false,
}: SeatMapProps) {
  const totalSeats = 40;
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

  // Generate the seat data with occupant mappings
  const seatGrid: { num: number; occupiedBy: Passenger | null }[] = [];
  for (let i = 1; i <= totalSeats; i++) {
    const occupiedBy = tripPassengers.find((p) => p.seatNo === i) || null;
    seatGrid.push({ num: i, occupiedBy });
  }

  // Statistics
  const totalBooked = tripPassengers.length;
  const totalAvailable = totalSeats - totalBooked;
  const occupancyPercentage = Math.round((totalBooked / totalSeats) * 100);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Visual Live Occupancy Stats & Progress Bar */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Coach Live Status</span>
            <span className="text-slate-700 font-bold">
              Bus <span className="font-extrabold text-purple-700">{busNo}</span> to {routeTo}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Occupancy Rate</span>
            <span className="font-extrabold text-slate-800">{occupancyPercentage}%</span>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${occupancyPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-black uppercase text-center">
          <div className="bg-white border border-slate-200/60 rounded-xl py-1.5 px-2">
            <span className="text-slate-400 block mb-0.5">Total</span>
            <span className="text-slate-800 text-sm">{totalSeats}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-1.5 px-2 text-emerald-800">
            <span className="text-emerald-500 block mb-0.5">Available</span>
            <span className="text-emerald-700 text-sm">{totalAvailable}</span>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-xl py-1.5 px-2 text-rose-800">
            <span className="text-rose-500 block mb-0.5">Booked</span>
            <span className="text-rose-700 text-sm">{totalBooked}</span>
          </div>
        </div>
      </div>

      {/* Outer Coach Chassis Body Visualization */}
      <div className="bg-slate-900 border-4 border-slate-800 rounded-t-[40px] rounded-b-[20px] shadow-2xl p-5 md:p-6 text-white max-w-md mx-auto relative overflow-hidden">
        
        {/* Subtle Bus Windshield Highlights */}
        <div className="absolute top-0 inset-x-0 h-12 bg-slate-950/40 rounded-t-[34px] border-b border-slate-800 flex items-center justify-center">
          <div className="w-16 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Front Dashboard / Cab Area */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6 pt-6 relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Front Cabin</span>
            <span className="text-[9px] font-semibold text-slate-400">Barako Coach Express</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Steering Wheel Representation */}
            <motion.div 
              className="w-8 h-8 rounded-full border-4 border-slate-600 flex items-center justify-center relative cursor-help"
              title="Steering System"
              whileHover={{ rotate: 15 }}
            >
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <div className="absolute inset-y-0 w-1 bg-slate-600 left-1/2 -translate-x-1/2" />
              <div className="absolute inset-x-0 h-1 bg-slate-600 top-1/2 -translate-y-1/2" />
            </motion.div>
            <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
              Driver
            </span>
          </div>
        </div>

        {/* Interactive Coach Layout Grid */}
        <div className="grid grid-cols-5 gap-3 relative z-10">
          
          {/* Column Titles */}
          <div className="text-[8px] font-black text-slate-500 text-center uppercase tracking-wider">Col A</div>
          <div className="text-[8px] font-black text-slate-500 text-center uppercase tracking-wider">Col B</div>
          <div className="text-[8px] font-black text-slate-500 text-center uppercase tracking-wider text-purple-600 font-mono">Walkway</div>
          <div className="text-[8px] font-black text-slate-500 text-center uppercase tracking-wider">Col C</div>
          <div className="text-[8px] font-black text-slate-500 text-center uppercase tracking-wider">Col D</div>

          {/* 10 rows of seating grid */}
          {Array.from({ length: 10 }).map((_, rowIdx) => {
            return (
              <React.Fragment key={rowIdx}>
                {/* 4 seats in this row: Col A, Col B, Aisle, Col C, Col D */}
                {[1, 2, 0, 3, 4].map((colType, colIdx) => {
                  // Aisle Spacer
                  if (colType === 0) {
                    return (
                      <div 
                        key={`aisle-${rowIdx}`}
                        className="h-10 flex items-center justify-center text-[8px] font-black text-slate-800"
                      >
                        •
                      </div>
                    );
                  }

                  // Compute absolute seat number
                  const sNum = rowIdx * 4 + colType;
                  const cell = seatGrid[sNum - 1];
                  const isOccupied = !!cell.occupiedBy;
                  const isSelected = selectedSeatNo === cell.num;

                  return (
                    <div key={`seat-${sNum}`} className="relative">
                      <motion.button
                        type="button"
                        onClick={() => {
                          if (!isOccupied && onSelectSeat && !readOnly) {
                            onSelectSeat(cell.num);
                          }
                        }}
                        onMouseEnter={() => setHoveredSeat(cell.num)}
                        onMouseLeave={() => setHoveredSeat(null)}
                        disabled={isOccupied && !readOnly}
                        whileHover={!isOccupied && !readOnly ? { scale: 1.08, y: -1 } : {}}
                        whileTap={!isOccupied && !readOnly ? { scale: 0.95 } : {}}
                        className={`w-full h-10 rounded-xl text-[10px] font-black flex flex-col items-center justify-center border transition-all duration-150 relative cursor-pointer select-none ${
                          isOccupied
                            ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-sm"
                            : isSelected
                            ? "bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300 shadow-md shadow-purple-900/40"
                            : "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                        } ${readOnly && isOccupied ? "cursor-help" : ""}`}
                        id={`btn-seat-${sNum}`}
                      >
                        <Armchair className={`w-3.5 h-3.5 ${isOccupied ? "text-rose-100" : isSelected ? "text-purple-100" : "text-emerald-100"}`} />
                        <span className="text-[9px] font-black mt-0.5">{cell.num}</span>

                        {/* Miniature status circle */}
                        <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                          isOccupied ? "bg-rose-200" : isSelected ? "bg-purple-200" : "bg-emerald-200"
                        }`} />
                      </motion.button>

                      {/* Seat Occupant Tooltip Overlay */}
                      <AnimatePresence>
                        {hoveredSeat === cell.num && isOccupied && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 bg-slate-950 text-white rounded-2xl p-3 text-[10px] z-50 shadow-2xl border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                              <span className="font-extrabold text-slate-200 uppercase tracking-wide text-[8px]">
                                SEAT {cell.num} RESERVED
                              </span>
                              <span className="text-purple-400 font-mono text-[8px] font-black">
                                {cell.occupiedBy?.ticketNo}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-slate-500 shrink-0" />
                                <p className="font-extrabold text-white truncate">{cell.occupiedBy?.name}</p>
                              </div>
                              <p className="text-slate-400 font-mono pl-4">📞 {cell.occupiedBy?.phone}</p>
                              <div className="flex justify-between items-center pt-1">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                                  cell.occupiedBy?.paymentStatus === "Paid"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/10"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/10"
                                }`}>
                                  {cell.occupiedBy?.paymentStatus}
                                </span>
                                <span className="text-slate-500 font-mono text-[8px]">{cell.occupiedBy?.paymentMethod}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bus rear view details */}
        <div className="border-t border-slate-800 mt-6 pt-4 flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
          <span>Engine Bay</span>
          <span>BJ-{busNo} Express Roster</span>
          <span>Tail Exhaust</span>
        </div>
      </div>

      {/* Aesthetic Legend Panel */}
      <div className="flex justify-center items-center gap-4 text-[10px] font-bold bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Armchair className="w-2 h-2 text-white" />
          </div>
          <span className="text-slate-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-rose-500 rounded-lg flex items-center justify-center">
            <Armchair className="w-2 h-2 text-white" />
          </div>
          <span className="text-slate-500">Booked</span>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 bg-purple-600 rounded-lg flex items-center justify-center">
              <Armchair className="w-2 h-2 text-white" />
            </div>
            <span className="text-slate-500">Your Choice</span>
          </div>
        )}
      </div>
    </div>
  );
}
