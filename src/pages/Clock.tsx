import React from 'react';
import { ClockWorkspace } from '@/components/clock/ClockWorkspace';

export const ClockPage: React.FC = () => (
  <div className="space-y-6">
    <header className="space-y-1">
      <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Clock studio</p>
      <h1 className="text-3xl font-heading text-[#111]">Master every timezone</h1>
      <p className="text-[#333]">Watchers, timers, and flyouts all run within the new React surface.</p>
    </header>
    <ClockWorkspace />
  </div>
);
