import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cyan-900/40 bg-slate-950 py-8 text-zinc-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">PYRO-ASTRA</span>
            <span className="text-zinc-500">|</span>
            <span>NASA Space Apps Challenge 2026</span>
            <span className="text-zinc-500">·</span>
            <span className="text-cyan-400">Flame in Freefall</span>
          </div>
          <div className="text-[11px] text-zinc-400 text-center md:text-right">
            <span>Primary Data Source: </span>
            <a
              href="https://psi.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              NASA Physical Sciences Informatics (PSI) System
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-zinc-500">
          <div>
            <strong className="text-zinc-400 block mb-1">Non-Negotiable Provenance:</strong>
            Every experimental number rendered in PYRO-ASTRA links to its source file, page/row, and DOI. Refuses rendering without provenance.
          </div>
          <div>
            <strong className="text-zinc-400 block mb-1">Gravity Validity Bounds:</strong>
            PSI holds only microgravity (0g) and Earth (1g) combustion records. Models and comparisons represent bounds; partial-gravity extrapolation is rejected.
          </div>
          <div>
            <strong className="text-zinc-400 block mb-1">Compliance & Attribution:</strong>
            NASA Physical Sciences Informatics credited in plain text. No NASA logos or insignia used. AI-generated text is explicitly labeled.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
