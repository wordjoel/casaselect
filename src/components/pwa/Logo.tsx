import React from "react";

interface LogoProps {
  variant?: "full" | "header" | "emblem";
  className?: string;
  isDarkMode?: boolean;
  size?: number; // width/height for emblem/header shield
}

export default function Logo({ variant = "full", className = "", isDarkMode = false, size = 44 }: LogoProps) {
  const renderShield = (shieldSize: number) => (
    <img
      src="/logo-kobacaselect.png"
      alt="Casa Select Logo"
      style={{
        width: shieldSize,
        height: shieldSize,
        backgroundColor: "#fcfaf5", // Matches the ivory/cream background of the PNG
        border: "1px solid rgba(185, 147, 67, 0.25)",
      }}
      className="object-contain rounded-[24%] shadow-sm select-none pointer-events-none"
    />
  );

  if (variant === "emblem") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderShield(size)}
      </div>
    );
  }

  if (variant === "header") {
    return (
      <div className={`flex items-center space-x-2.5 select-none cursor-pointer ${className}`}>
        {renderShield(size)}
        <div className="flex flex-col text-left leading-none">
          <span 
            className="font-serif font-bold tracking-[0.05em] text-[13px]"
            style={{
              backgroundImage: "linear-gradient(135deg, #FFF5D6 0%, #D4AF37 55%, #8A640F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
              textShadow: "0px 1px 1px rgba(0,0,0,0.05)"
            }}
          >
            Casa Select
          </span>
          <span className="text-[7.5px] tracking-[0.14em] opacity-60 uppercase font-black mt-[2.5px] dark:text-neutral-300 text-amber-950/80">
            Luxury Management
          </span>
        </div>
      </div>
    );
  }

  // Variant Full: Displays center shield, large brand name, divider, and tagline
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Floating Animated Shield */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="absolute -inset-2.5 bg-gradient-to-r from-[#D4AF37]/15 to-[#8A640F]/8 rounded-full blur-2xl opacity-50 animate-pulse pointer-events-none" />
        {renderShield(size)}
      </div>

      {/* Brand Title - Exact matching Serif typography and capitalization with subtle 3D metal stroke */}
      <h1 
        className="font-serif font-bold text-[26px] tracking-[0.03em] leading-tight mt-1 text-center relative"
        style={{
          backgroundImage: "linear-gradient(135deg, #FFF9EB 0%, #E6C687 25%, #C59B27 60%, #805A10 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
          filter: "drop-shadow(0px 2px 3px rgba(75, 51, 5, 0.15))"
        }}
      >
        Casa Select
      </h1>

      {/* Premium Horizontal golden divider with diamond flare */}
      <div className="flex items-center justify-center my-2.5 w-full">
        <svg width="220" height="10" viewBox="0 0 220 10" fill="none" className="overflow-visible">
          <defs>
            <linearGradient id="goldDivider" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="#805A10" />
              <stop offset="50%" stopColor="#FFF5D6" />
              <stop offset="80%" stopColor="#805A10" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="goldInner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE6A3" />
              <stop offset="50%" stopColor="#C59B27" />
              <stop offset="100%" stopColor="#8A640F" />
            </linearGradient>
          </defs>
          {/* Tapered accent lines fading to transparent */}
          <path d="M 10 5 L 110 4 L 210 5 L 110 6 Z" fill="url(#goldDivider)" opacity="0.85" />
          <path d="M 30 5 L 110 4.5 L 190 5 L 110 5.5 Z" fill="#FFF" opacity="0.15" />
          {/* Glowing central multi-bevel diamond */}
          <path d="M 110 1 L 115 5 L 110 9 L 105 5 Z" fill="#805A10" />
          <path d="M 110 2 L 113.8 5 L 110 8 L 106.2 5 Z" fill="url(#goldInner)" />
          {/* Glowing lens highlight */}
          <circle cx="110" cy="5" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Two-line tagline matching the attached luxury layout and typography */}
      <div className="flex flex-col items-center justify-center leading-normal mt-0.5 space-y-0.5 select-text">
        <p className={`text-[10.5px] font-sans font-medium tracking-[0.14em] ${
          isDarkMode ? "text-neutral-400" : "text-amber-950/75"
        }`}>
          Gestão <span 
            className="font-extrabold font-sans"
            style={{
              backgroundImage: "linear-gradient(135deg, #FFF5D6 0%, #D4AF37 50%, #8A640F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            inteligente.
          </span>
        </p>
        <p className={`text-[10.5px] font-sans font-medium tracking-[0.14em] ${
          isDarkMode ? "text-neutral-400" : "text-amber-950/75"
        }`}>
          Resultados reais.
        </p>
      </div>
    </div>
  );
}
