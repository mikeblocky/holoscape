import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const PRESET_ZONES = [
  { label: 'NYC', zone: 'America/New_York' },
  { label: 'London', zone: 'Europe/London' },
  { label: 'Tokyo', zone: 'Asia/Tokyo' },
  { label: 'Sydney', zone: 'Australia/Sydney' }
];

type Watcher = {
  id: string;
  label: string;
  zone: string;
};

type Flyout = {
  id: string;
  type: 'timer' | 'stopwatch';
  seconds: number;
  running: boolean;
  x: number;
  y: number;
};

const FLYOUT_WIDTH = 256;
const FLYOUT_HEIGHT = 200;
const FLYOUT_MARGIN = 16;

const format = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

export const ClockWorkspace: React.FC = () => {
  const [localNow, setLocalNow] = useState(() => new Date());
  const [presetZone, setPresetZone] = useState(PRESET_ZONES[0].zone);
  const [watchers, setWatchers] = useLocalStorage<Watcher[]>('holoscape:clock:watchers', []);
  const [flyouts, setFlyouts] = useState<Flyout[]>([]);
  const [draggingFlyout, setDraggingFlyout] = useState<{
    id: string;
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [label, setLabel] = useState('Berlin studio');
  const [zone, setZone] = useState('Europe/Berlin');
  const [timerInput, setTimerInput] = useState('600');

  useEffect(() => {
    const id = window.setInterval(() => setLocalNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const presetLabel = PRESET_ZONES.find((entry) => entry.zone === presetZone)?.label ?? 'Preset';

  const addWatcher = () => {
    if (!label.trim() || !zone.trim()) return;
    setWatchers([{ id: crypto.randomUUID(), label: label.trim(), zone: zone.trim() }, ...watchers]);
    setLabel('');
    setZone('');
  };

  const clampFlyoutPosition = useCallback((x: number, y: number) => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 720;
    const maxX = Math.max(FLYOUT_MARGIN, viewportWidth - FLYOUT_WIDTH - FLYOUT_MARGIN);
    const maxY = Math.max(80, viewportHeight - FLYOUT_HEIGHT - FLYOUT_MARGIN);
    return {
      x: Math.min(Math.max(FLYOUT_MARGIN, x), maxX),
      y: Math.min(Math.max(80, y), maxY)
    };
  }, []);

  const addFlyout = (type: Flyout['type']) => {
    const baseSeconds = type === 'timer' ? parseInt(timerInput, 10) || 0 : 0;
    setFlyouts((prev) => {
      const offset = prev.length * 28;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const initialX = viewportWidth - FLYOUT_WIDTH - 40 - offset;
      const initialY = 120 + offset;
      const nextPosition = clampFlyoutPosition(initialX, initialY);
      return [
        {
          id: crypto.randomUUID(),
          type,
          seconds: baseSeconds,
          running: type === 'timer' && baseSeconds > 0,
          x: nextPosition.x,
          y: nextPosition.y
        },
        ...prev
      ];
    });
  };

  useEffect(() => {
    if (!draggingFlyout) {
      return;
    }
    const handleMove = (event: PointerEvent) => {
      if (event.pointerId !== draggingFlyout.pointerId) {
        return;
      }
      const nextPosition = clampFlyoutPosition(event.clientX - draggingFlyout.offsetX, event.clientY - draggingFlyout.offsetY);
      setFlyouts((prev) =>
        prev.map((entry) => (entry.id === draggingFlyout.id ? { ...entry, x: nextPosition.x, y: nextPosition.y } : entry))
      );
    };
    const handleUp = (event: PointerEvent) => {
      if (event.pointerId === draggingFlyout.pointerId) {
        setDraggingFlyout(null);
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [clampFlyoutPosition, draggingFlyout]);

  useEffect(() => {
    const handleResize = () => {
      setFlyouts((prev) =>
        prev.map((entry) => {
          const nextPosition = clampFlyoutPosition(entry.x, entry.y);
          return {
            ...entry,
            x: nextPosition.x,
            y: nextPosition.y
          };
        })
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampFlyoutPosition]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFlyouts((prev) =>
        prev.map((flyout) => {
          if (!flyout.running) return flyout;
          if (flyout.type === 'stopwatch') {
            return { ...flyout, seconds: flyout.seconds + 1 };
          }
          if (flyout.type === 'timer') {
            if (flyout.seconds <= 0) {
              return { ...flyout, running: false, seconds: 0 };
            }
            return { ...flyout, seconds: flyout.seconds - 1 };
          }
          return flyout;
        })
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const presetTime = useMemo(() => {
    try {
      return new Date(localNow.toLocaleString('en-US', { timeZone: presetZone }));
    } catch {
      return localNow;
    }
  }, [localNow, presetZone]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-none border-2 border-[#ffffff] bg-[#c0c0c0] p-6 text-[#111] shadow-[3px_3px_0_#202020] md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Local time</p>
          <h1 className="mt-4 text-5xl font-heading text-[#000]">{localNow.toLocaleTimeString()}</h1>
          <p className="mt-2 text-lg text-[#111]">{localNow.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Preset zone</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {PRESET_ZONES.map((preset) => (
              <Button key={preset.zone} variant="subtle" onClick={() => setPresetZone(preset.zone)}>
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="mt-4 win95-panel">
            <p className="text-sm text-[#333]">{presetLabel}</p>
            <p className="text-3xl font-heading text-[#000]">{presetTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timers & stopwatches</CardTitle>
            <CardDescription>Spawn floating controls. Timer input uses seconds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                type="number"
                min="0"
                placeholder="Seconds"
                value={timerInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTimerInput(event.target.value)}
                className="max-w-[140px]"
              />
              <Button onClick={() => addFlyout('timer')}>New timer</Button>
              <Button variant="subtle" onClick={() => addFlyout('stopwatch')}>
                New stopwatch
              </Button>
            </div>
            <p className="text-xs text-[#333]">Flyouts stay visible on every page.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custom watchers</CardTitle>
            <CardDescription>Keep collaborators in view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Label" value={label} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLabel(event.target.value)} />
              <Input
                placeholder="IANA timezone"
                value={zone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setZone(event.target.value)}
              />
            </div>
            <Button onClick={addWatcher}>Add watcher</Button>
            <div className="space-y-3">
              {watchers.map((watcher: Watcher) => {
                let timeString = 'Invalid zone';
                try {
                  timeString = new Date().toLocaleTimeString('en-US', { timeZone: watcher.zone });
                } catch {
                  timeString = 'Invalid zone';
                }
                return (
                  <div key={watcher.id} className="flex items-center justify-between gap-4 win95-panel text-sm">
                    <div>
                      <p className="font-semibold text-[#000]">{watcher.label}</p>
                      <p className="text-[#333]">{watcher.zone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-lg text-[#000]">{timeString}</p>
                      <button
                        className="text-xs text-[#333] underline"
                        onClick={() => setWatchers(watchers.filter((entry: Watcher) => entry.id !== watcher.id))}
                      >
                        remove
                      </button>
                    </div>
                  </div>
                );
              })}
              {!watchers.length && <p className="text-sm text-[#333]">No watchers yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      {flyouts.map((flyout) => (
        <div
          key={flyout.id}
          className="fixed z-30 w-64 win95-window p-4"
          style={{ top: flyout.y, left: flyout.x }}
        >
          <div
            className="flex items-center justify-between cursor-grab"
            style={{ touchAction: 'none' }}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest('button')) {
                return;
              }
              event.preventDefault();
              const container = event.currentTarget.parentElement as HTMLDivElement | null;
              if (!container) {
                return;
              }
              const bounds = container.getBoundingClientRect();
              (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
              setDraggingFlyout({
                id: flyout.id,
                pointerId: event.pointerId,
                offsetX: event.clientX - bounds.left,
                offsetY: event.clientY - bounds.top
              });
            }}
          >
            <Badge>{flyout.type}</Badge>
            <button
              className="text-[#111]"
              onClick={() => setFlyouts((prev) => prev.filter((entry) => entry.id !== flyout.id))}
            >
              ✕
            </button>
          </div>
          <p className="mt-4 text-center text-3xl font-heading text-[#000]">{format(flyout.seconds)}</p>
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              variant="subtle"
              onClick={() =>
                setFlyouts((prev: Flyout[]) =>
                  prev.map((entry) =>
                    entry.id === flyout.id
                      ? { ...entry, running: !entry.running || entry.seconds <= 0 ? true : !entry.running }
                      : entry
                  )
                )
              }
            >
              {flyout.running ? 'Pause' : 'Start'}
            </Button>
            {flyout.type === 'timer' ? (
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() =>
                  setFlyouts((prev: Flyout[]) =>
                    prev.map((entry) => (entry.id === flyout.id ? { ...entry, seconds: parseInt(timerInput, 10) || 0 } : entry))
                  )
                }
              >
                Reset
              </Button>
            ) : (
              <Button
                className="flex-1"
                variant="ghost"
                onClick={() =>
                  setFlyouts((prev: Flyout[]) =>
                    prev.map((entry) => (entry.id === flyout.id ? { ...entry, seconds: 0 } : entry))
                  )
                }
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
