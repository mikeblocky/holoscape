import React from 'react';
import { CalendarBoard } from '@/components/calendar/CalendarBoard';

export const CalendarPage: React.FC = () => (
  <div className="space-y-6">
    <header className="space-y-1">
      <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Calendar</p>
      <h1 className="text-3xl font-heading text-[#111]">Date-linked notes with palette cues</h1>
      <p className="text-[#333]">Add entries per day and keep colors aligned with the taskbar accent.</p>
    </header>
    <CalendarBoard />
  </div>
);
