// src/components/GlowCard.tsx
import React from "react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlowCard: React.FC<GlowCardProps> = ({ children, className }) => {
  return (
    <div
      className={`relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl group ${className}`}
    >
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 blur-md"></div>
      <div className="relative h-full w-full bg-slate-800/80 rounded-2xl p-6">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
