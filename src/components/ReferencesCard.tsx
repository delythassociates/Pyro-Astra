'use client';

import React from 'react';
import { BookOpen, FileText, ShieldCheck, ExternalLink } from 'lucide-react';

interface ReferencesCardProps {
  selectedMaterial?: string;
  selectedPreset?: {
    id: string;
    name: string;
    o2: number;
    pressure: number;
    gravity: string;
    description: string;
  };
}

export function ReferencesCard({ selectedMaterial, selectedPreset }: ReferencesCardProps) {
  const citations = [
    {
      title: 'Atmospheric Definition for Planned Lunar Exploration Habitat',
      report: 'NASA NTRS 20210022143',
      detail: 'Life Support Baseline Values and Assumptions: 34% O₂ at 8.2 psi (56.5 kPa), 0.16g.',
      url: 'https://ntrs.nasa.gov/citations/20210022143',
      tag: 'Preset Standard',
    },
    {
      title: 'Burning and Suppression of Solids - II (BASS-II) Technical Memorandum',
      report: 'NASA/TM-20210011385',
      detail: 'Table 5.1 (p. 57): 20 flat-PMMA flight burn tests (M1–M20) across 2.0–21.0 cm/s flow velocities.',
      url: 'https://doi.org/10.26030/d645-a496',
      tag: 'BASS-II Table 5.1',
    },
    {
      title: 'Flame Extinction Experiment (FLEX / FLEX-2) Isolated Droplet Combustion',
      report: 'NASA PSI Investigations PSI-69 & PSI-68',
      detail: 'Isolated heptane, methanol, and alkane droplet burning kinetics and radiative extinction diameters in microgravity.',
      url: 'https://doi.org/10.26030/1715-7389',
      tag: 'Droplet Kinetics',
    },
  ];

  const sourceFiles = [
    {
      name: 'PSI-25_Experimental_table_BASS-II.csv',
      path: 'raw_real/PSI-25/experimental_table/',
      sha256: '9f2a969747970c634020a13ee42a34fc3cf264cf2333cf46ceefdf0ad697d8c5',
      desc: '129 flight runs for solid rods, slabs, and fabrics on ISS MSG',
    },
    {
      name: 'PSI-69_Experimental table_FLEX.csv',
      path: 'raw_real/PSI-69/experimental_table/',
      sha256: 'e82b7cf533a1e9411985eeea989fe78096181f08e4ba436fcfaee61a6fa34d85',
      desc: '274 droplet combustion runs in Multi-user Droplet Combustion Chamber',
    },
    {
      name: 'manifest.sha256',
      path: 'release/',
      sha256: 'Signed SHA-256 Checksum Manifest',
      desc: 'Official signed release checksums for all ingested matrices and tables',
    },
  ];

  return (
    <div className="bg-[#FAF8F3] border border-[#D5CFC2] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-5">
      <div className="flex items-center justify-between border-b border-[#D5CFC2] pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#1D4ED8]" />
          <h3 className="font-mono text-xs font-bold text-[#181615] uppercase tracking-wider">
            Scientific Lineage, References &amp; Primary NASA Citations
          </h3>
        </div>
        <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] text-[10px] font-mono font-bold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#15803D]" />
          <span>100% NASA Grounded</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
        {/* Left: Literature Citations */}
        <div className="space-y-3">
          <span className="font-mono text-[11px] font-bold text-[#736B5E] uppercase tracking-wider block">
            Primary Technical Reports &amp; Standards
          </span>
          <div className="space-y-2.5">
            {citations.map((c) => (
              <div
                key={c.report}
                className="p-3 bg-[#F4F1EA] border border-[#D5CFC2] space-y-1 hover:border-[#1D4ED8] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#181615] text-xs">{c.report}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FAF8F3] text-[#5A544A] border border-[#D5CFC2]">
                    {c.tag}
                  </span>
                </div>
                <div className="font-semibold text-[#1D4ED8]">{c.title}</div>
                <p className="text-[#5A544A] leading-relaxed text-[11px]">{c.detail}</p>
                <div className="pt-1">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1D4ED8] hover:underline font-mono text-[10px] font-medium inline-flex items-center gap-1"
                  >
                    <span>View Repository Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ingested Source Files & Checksums */}
        <div className="space-y-3">
          <span className="font-mono text-[11px] font-bold text-[#736B5E] uppercase tracking-wider block">
            Authentic Source Files &amp; SHA-256 Checksums
          </span>
          <div className="space-y-2.5">
            {sourceFiles.map((sf) => (
              <div
                key={sf.name}
                className="p-3 bg-[#F4F1EA] border border-[#D5CFC2] space-y-1 hover:border-[#1D4ED8] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5A544A]" />
                  <span className="font-mono font-bold text-[#181615] text-xs">{sf.name}</span>
                </div>
                <p className="text-[#5A544A] text-[11px] leading-relaxed">{sf.desc}</p>
                <div className="p-2 bg-[#FAF8F3] border border-[#D5CFC2] font-mono text-[10px] text-[#5A544A] truncate">
                  SHA-256: <span className="text-[#181615] font-semibold">{sf.sha256}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferencesCard;
