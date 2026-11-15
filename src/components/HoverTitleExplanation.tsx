'use client';

import React, { useState } from 'react';

interface HoverTitleExplanationProps {
  title: string;
  summary: string;
  badge?: string;
  className?: string;
}

export function HoverTitleExplanation({
  title,
  summary,
  badge,
  className = '',
}: HoverTitleExplanationProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="inline-flex items-center gap-3 cursor-help border-b-2 border-dotted border-[#181615]/50 hover:border-[#1D4ED8] transition-colors group select-none py-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered((prev) => !prev)}
        aria-label={`Explanation for ${title}`}
      >
        <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#181615]">
          {title}
        </h1>
        <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-[#EAE5DB] text-[#5A544A] border border-[#D5CFC2] group-hover:bg-[#181615] group-hover:text-[#FAF8F3] transition-colors">
          [?] HOVER FOR SUMMARY
        </span>
      </div>

      {/* Floating Plain-English Explanation Popover on Hover */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-2 w-[520px] max-w-[90vw] bg-[#181615] text-[#FAF8F3] p-4 border border-[#D5CFC2] shadow-2xl z-50 text-sm font-normal leading-relaxed animate-in fade-in zoom-in-95 duration-100 pointer-events-none"
        >
          <div className="flex items-center justify-between border-b border-[#33302C] pb-2 mb-2 font-mono text-xs">
            <span className="font-bold text-[#FAF8F3] uppercase tracking-wider">
              Plain-English Scientific Summary
            </span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#33302C] text-[#D5CFC2] font-semibold">
                {badge}
              </span>
            )}
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#FAF8F3] leading-relaxed">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}

export default HoverTitleExplanation;
