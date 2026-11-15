'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DashboardMode = 'beginner' | 'advanced';
export type GuideTab =
  | 'quickstart'
  | 'flow-regimes'
  | 'oxygen-isolation'
  | 'data-pipeline'
  | 'surrogate-models';

interface DashboardContextType {
  dashboardMode: DashboardMode;
  setDashboardMode: (mode: DashboardMode) => void;
  guideOpen: boolean;
  guideTab: GuideTab;
  openGuide: (tab?: GuideTab) => void;
  closeGuide: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('beginner');
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [guideTab, setGuideTab] = useState<GuideTab>('quickstart');

  const openGuide = (tab?: GuideTab) => {
    if (tab) {
      setGuideTab(tab);
    }
    setGuideOpen(true);
  };

  const closeGuide = () => {
    setGuideOpen(false);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardMode,
        setDashboardMode,
        guideOpen,
        guideTab,
        openGuide,
        closeGuide,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
