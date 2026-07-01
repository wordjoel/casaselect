import React from "react";

interface LogoProps {
  variant?: "full" | "header" | "emblem";
  className?: string;
  isDarkMode?: boolean;
  size?: number; // width/height for emblem/header shield
}

export default function Logo({ variant = "full", className = "", isDarkMode = false, size = 44 }: LogoProps) {
  if (variant === "emblem") {
    return (
      <div 
        className={`overflow-hidden rounded-full bg-[#FFFDF9] border border-[#E6C687] flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img 
          src="/logo.jpg" 
          alt="L | STAYS Emblem" 
          className="w-[180%] max-w-none h-auto object-cover object-left"
          style={{ marginLeft: "-4%" }}
        />
      </div>
    );
  }

  // Full / Header wide logo containing emblem and stays text
  const width = variant === "full" ? size * 3.5 : size * 2.8;
  return (
    <div 
      className={`overflow-hidden rounded-xl bg-[#FFFDF9] border border-[#E6C687] p-1 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: width, height: size }}
    >
      <img 
        src="/logo.jpg" 
        alt="L | STAYS Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
