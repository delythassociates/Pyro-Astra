'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useDashboard, GuideTab } from '@/context/DashboardContext';

export interface InfoButtonProps {
  guideTab?: GuideTab;
  tab?: GuideTab;
  title?: string;
  tooltip?: string;
  className?: string;
}

export function InfoButton({
  guideTab,
  tab,
  title,
  tooltip,
  className = '',
}: InfoButtonProps) {
  const { openGuide } = useDashboard();
  const targetTab = guideTab || tab || 'quickstart';
  const label = tooltip || title || 'Learn more in User Guide';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openGuide(targetTab);
      }}
      title={label}
      className={`inline-flex items-center justify-center p-1 rounded-full text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500 ${className}`}
      aria-label={label}
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </button>
  );
}
