import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
}

export default function Logo({ className = "", size = "md", hideText = false }: LogoProps) {
  const dimensions = {
    sm: { icon: "w-8 h-8", text: "text-lg", sub: "text-[8px]" },
    md: { icon: "w-11 h-11", text: "text-xl", sub: "text-[10px]" },
    lg: { icon: "w-16 h-16", text: "text-3xl", sub: "text-[12px]" },
  };

  const current = dimensions[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Badge */}
      <div className={`${current.icon} bg-gradient-to-tr from-purple-900 to-indigo-800 rounded-xl p-1.5 shadow-md flex items-center justify-center relative overflow-hidden shrink-0 border border-purple-500/25`}>
        {/* Abstract bus vector inside SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Speed swoops */}
          <path
            d="M5 25C25 25 35 15 65 15C95 15 95 35 95 35L90 60C90 60 85 75 60 75C35 75 15 75 5 75V25Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          {/* Bus body */}
          <rect x="15" y="32" width="70" height="34" rx="8" fill="currentColor" />
          {/* Windshield */}
          <path d="M62 36H81C83 36 84 37 84 39V50H62V36Z" fill="#1e1b4b" />
          {/* Side windows */}
          <rect x="22" y="36" width="10" height="10" rx="2" fill="#1e1b4b" />
          <rect x="35" y="36" width="10" height="10" rx="2" fill="#1e1b4b" />
          <rect x="48" y="36" width="10" height="10" rx="2" fill="#1e1b4b" />
          {/* Wheels */}
          <circle cx="32" cy="67" r="10" fill="#090514" stroke="currentColor" strokeWidth="3" />
          <circle cx="32" cy="67" r="3" fill="currentColor" />
          <circle cx="68" cy="67" r="10" fill="#090514" stroke="currentColor" strokeWidth="3" />
          <circle cx="68" cy="67" r="3" fill="currentColor" />
          {/* Headlight flare */}
          <path d="M84 56L98 52V62L84 56Z" fill="#fbbf24" opacity="0.8" />
          {/* Grille details */}
          <rect x="80" y="55" width="5" height="6" rx="1" fill="#9ca3af" />
        </svg>
      </div>

      {/* Corporate Typography */}
      {!hideText && (
        <div className="flex flex-col leading-none">
          <span className={`${current.text} font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900`}>
            BARAKO
          </span>
          <span className={`${current.sub} font-extrabold tracking-wider text-indigo-700 mt-1`}>
            TRANSPORTATION & LOGISTICS
          </span>
        </div>
      )}
    </div>
  );
}
