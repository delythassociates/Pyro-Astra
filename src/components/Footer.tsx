import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#D5CFC2] bg-[#EAE5DB] py-8 text-[#5A544A] text-xs font-mono">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 xl:px-10 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#D5CFC2] pb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#181615] tracking-wider">PYRO-ASTRA</span>
            <span className="text-[#A8A296]">|</span>
            <span>NASA Space Apps Challenge 2026</span>
            <span className="text-[#A8A296]">·</span>
            <span className="text-[#1D4ED8] font-semibold">Flame in Freefall</span>
          </div>
          <div className="text-[11px] text-[#6A645A] text-center md:text-right">
            <span>Primary Data Source: </span>
            <a
              href="https://psi.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1D4ED8] underline hover:text-[#1e40af] font-medium"
            >
              NASA Physical Sciences Informatics (PSI) System
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-[#5A544A]">
          <div>
            <strong className="text-[#181615] block mb-1">Non-Negotiable Provenance:</strong>
            Every experimental value rendered in PYRO-ASTRA links directly to its source file, page/row, and DOI. The interface strictly refuses to render numbers without provenance.
          </div>
          <div>
            <strong className="text-[#181615] block mb-1">Gravity Validity Bounds:</strong>
            NASA PSI holds microgravity (0g) and Earth (1g) combustion records only. Partial-gravity extrapolation to lunar (0.16g) or martian (0.38g) conditions is deterministically refused.
          </div>
          <div>
            <strong className="text-[#181615] block mb-1">Compliance & Attribution:</strong>
            NASA Physical Sciences Informatics is credited in plain text. No NASA logos or insignia are used. All AI-generated synthesis text is explicitly labeled.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
