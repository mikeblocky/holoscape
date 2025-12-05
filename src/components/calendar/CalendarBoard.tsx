import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

const palette = ['#c9daff', '#ffacbb', '#c38f7a', '#b6f2a5'];

type CalendarNote = {
  id: string;
  date: string;
  text: string;
  color: string;
};

const getMonthMatrix = (anchor: Date) => {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const days = [] as (Date | null)[];
  for (let i = 0; i < start.getDay(); i++) {
    days.push(null);
  }
  for (let day = 1; day <= end.getDate(); day++) {
    days.push(new Date(anchor.getFullYear(), anchor.getMonth(), day));
  }
  return days;
};

export const CalendarBoard: React.FC = () => {
  const [anchor, setAnchor] = useState(() => new Date());
  const [notes, setNotes] = useLocalStorage<CalendarNote[]>('holoscape:calendar', []);
  const [draft, setDraft] = useState('');
  const [selectedColor, setSelectedColor] = useState(palette[0]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const matrix = useMemo(() => getMonthMatrix(anchor), [anchor]);
  const monthLabel = anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes([
      {
        id: crypto.randomUUID(),
        date: selectedDate,
        color: selectedColor,
        text: draft.trim()
      },
      ...notes
    ]);
    setDraft('');
  };

  const notesForDay = (date: string) => notes.filter((note: CalendarNote) => note.date === date);
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{monthLabel}</CardTitle>
          <CardDescription>Tap a date to attach a note. Colors sync with the taskbar palette.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.2em] text-[#444]">
            {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {matrix.map((entry, index) => {
              if (!entry) return <div key={`empty-${index}`} className="min-h-[80px] rounded border border-transparent" />;
              const iso = entry.toISOString().split('T')[0];
              const dayNotes = notesForDay(iso);
              const isSelected = selectedDate === iso;
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={[
                    'min-h-[80px]',
                    'rounded-[6px]',
                    'border-2 border-[#808080]',
                    'bg-[#dcdcdc]',
                    'p-2 text-left text-sm text-[#111]',
                    'shadow-[3px_3px_0_#202020]'
                  ]
                    .concat(isSelected ? ['outline outline-1 outline-[#000]'] : [])
                    .join(' ')}
                >
                  <div className="flex items-center justify-between text-xs text-[#333]">
                    <span className="font-semibold text-[#111]">{entry.getDate()}</span>
                    {iso === todayIso && <Badge variant="success">today</Badge>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dayNotes.slice(0, 3).map((note: CalendarNote) => (
                      <span key={note.id} className="h-2 w-8 rounded-full" style={{ backgroundColor: note.color }} />
                    ))}
                  </div>
                  {isSelected && <div className="mt-3 h-1 rounded-full" style={{ backgroundColor: selectedColor }} />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>{selectedDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {palette.map((color) => (
              <button
                key={color}
                className={cn('win95-accent-chip', selectedColor === color && 'is-active')}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <Input
            placeholder="Drop a short note"
            value={draft}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
          />
          <Button onClick={addNote}>Save note</Button>
          <div className="space-y-3">
            {notesForDay(selectedDate).map((note: CalendarNote) => (
              <div key={note.id} className="win95-panel p-3 text-sm text-[#111]">
                <div className="flex items-center justify-between">
                  <span>{note.text}</span>
                  <button
                    className="text-xs text-[#333] underline"
                    onClick={() => setNotes(notes.filter((entry: CalendarNote) => entry.id !== note.id))}
                  >
                    remove
                  </button>
                </div>
                <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: note.color }} />
              </div>
            ))}
            {!notesForDay(selectedDate).length && <p className="text-sm text-[#333]">No notes yet for this date.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
