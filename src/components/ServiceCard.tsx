import React from "react";
import { ArrowRight, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { DigitalService } from "../types";

interface ServiceCardProps {
  key?: string;
  service: DigitalService;
  onSelect: (service: DigitalService) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const isMatch = typeof service.matchPercentage !== "undefined";

  return (
    <div 
      className={`group relative bg-[#050505] border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:border-[#00FF66] ${
        isMatch 
          ? "border-[#00FF66] ring-1 ring-[#00FF66]/10 shadow-[0_0_15px_rgba(0,255,102,0.04)] mt-2" 
          : "border-zinc-850"
      }`}
    >
      {/* Semantic match banner */}
      {isMatch && (
        <div className="absolute -top-3 left-3 bg-[#00FF66] text-black px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center space-x-1 shadow-sm font-mono">
          <Sparkles className="w-2.5 h-2.5 text-black" />
          <span>Match Score: {service.matchPercentage}%</span>
        </div>
      )}

      <div>
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
            {service.category} PORTFOLIO
          </span>
          <div className="flex items-center space-x-1 text-[10px] text-[#00FF66]">
            <Star className="w-2.5 h-2.5 fill-[#00FF66] text-[#00FF66]" />
            <span className="font-semibold text-zinc-300">{service.metrics.rating.toFixed(1)}</span>
            <span className="text-zinc-600">({service.metrics.buyers})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-base sm:text-lg text-white group-hover:text-[#00FF66] transition-colors leading-snug">
          {service.title}
        </h3>

        {/* Semantic match details */}
        {isMatch && service.matchReason && (
          <p className="mt-2 bg-[#000000] text-zinc-300 text-[10px] p-2 rounded-md border border-zinc-900 font-sans leading-normal">
            <strong className="text-[#00FF66]">Logic:</strong> {service.matchReason}
          </p>
        )}

        {/* Description */}
        <p className="mt-1.5 text-[11px] sm:text-xs text-zinc-400 font-sans leading-snug line-clamp-2">
          {service.shortDesc}
        </p>

        {/* Details Checklist */}
        <div className="mt-3 pt-3 border-t border-zinc-900 space-y-1.5">
          <div className="flex items-start text-[10px] text-zinc-300 leading-tight">
            <CheckCircle2 className="w-3 h-3 text-[#00FF66] mr-1.5 mt-0.5 shrink-0" />
            <span>Curated setup & optimization</span>
          </div>
          <div className="flex items-start text-[10px] text-zinc-300 leading-tight">
            <CheckCircle2 className="w-3 h-3 text-[#00FF66] mr-1.5 mt-0.5 shrink-0" />
            <span>Delivery: <span className="font-semibold text-white">{service.metrics.timeToDeliver}</span></span>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-semibold font-mono">
            INVESTMENT
          </span>
          <span className="text-lg font-display font-semibold text-white">
            ${service.baseClientPrice}
            <span className="text-[9px] font-normal text-zinc-500 ml-1">/ route</span>
          </span>
        </div>

        <button 
          onClick={() => onSelect(service)}
          className="bg-white hover:bg-[#00FF66] text-black hover:text-black font-semibold text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
        >
          <span>Configure</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
