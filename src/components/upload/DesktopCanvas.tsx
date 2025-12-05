import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const WINDOW_WIDTH = 320;
const WINDOW_HEIGHT = 240;
const CANVAS_PADDING = 12;
const MIN_WINDOW_WIDTH = 220;
const MIN_WINDOW_HEIGHT = 200;
const MIN_OVERLAY_WIDTH = 240;
const MIN_OVERLAY_HEIGHT = 200;
const WINDOW_TABS = [
  { key: 'image', label: 'Image' },
  { key: 'notes', label: 'Notes' },
  { key: 'details', label: 'Details' }
] as const;

type WindowTab = (typeof WINDOW_TABS)[number]['key'];

type DesktopWindow = {
  id: string;
  title: string;
  notes: string;
  image?: string | null;
  imageName?: string;
  activeTab: WindowTab;
  createdAt: string;
  updatedAt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
};

type OverlayKey = 'info' | 'controls';

type OverlayLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OverlayInteraction =
  | {
      type: 'move';
      key: OverlayKey;
      pointerId: number;
      offsetX: number;
      offsetY: number;
      width: number;
      height: number;
    }
  | {
      type: 'resize';
      key: OverlayKey;
      pointerId: number;
      startPointerX: number;
      startPointerY: number;
      startWidth: number;
      startHeight: number;
    };

type WindowResizeState = {
  id: string;
  pointerId: number;
  startPointerX: number;
  startPointerY: number;
  startWidth: number;
  startHeight: number;
  x: number;
  y: number;
};

export const DesktopCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [windows, setWindows] = useLocalStorage<DesktopWindow[]>('holoscape:desk:windows', []);
  const [autoStack, setAutoStack] = useLocalStorage('holoscape:desk:autoStack', true);
  const [showGrid, setShowGrid] = useLocalStorage('holoscape:desk:grid', false);
  const [persist, setPersist] = useLocalStorage('holoscape:desk:persist', true);
  const [draftTitle, setDraftTitle] = useState('New ref');
  const [dragging, setDragging] = useState<
    { id: string; offsetX: number; offsetY: number; pointerId: number; width: number; height: number } | null
  >(null);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [showInfoWindow, setShowInfoWindow] = useState(true);
  const [showControlsWindow, setShowControlsWindow] = useState(true);
  const [overlayLayouts, setOverlayLayouts] = useState<Record<OverlayKey, OverlayLayout>>(() => ({
    info: { x: 24, y: 24, width: 320, height: 260 },
    controls: { x: 24, y: 300, width: 360, height: 340 }
  }));
  const [overlayInteraction, setOverlayInteraction] = useState<OverlayInteraction | null>(null);
  const [resizingWindow, setResizingWindow] = useState<WindowResizeState | null>(null);

  useEffect(() => {
    if (!persist) {
      setWindows([]);
    }
  }, [persist, setWindows]);

  useEffect(() => {
    setWindows((prev: DesktopWindow[]) => {
      let hasChanges = false;
      const next = prev.map((item) => {
        const patched: DesktopWindow = {
          ...item,
          notes: item.notes ?? item.content ?? 'Log your references here.',
          image: item.image ?? null,
          activeTab: item.activeTab ?? 'image',
          createdAt: item.createdAt ?? new Date().toISOString(),
          updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
          width: item.width ?? WINDOW_WIDTH,
          height: item.height ?? WINDOW_HEIGHT
        };
        if (
          patched.notes !== item.notes ||
          patched.image !== item.image ||
          patched.activeTab !== item.activeTab ||
          patched.createdAt !== item.createdAt ||
          patched.updatedAt !== item.updatedAt ||
          patched.width !== item.width ||
          patched.height !== item.height
        ) {
          hasChanges = true;
        }
        return patched;
      });
      return hasChanges ? next : prev;
    });
  }, [setWindows]);

  const clampPosition = useCallback(
    (x: number, y: number, width = WINDOW_WIDTH, height = WINDOW_HEIGHT) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return { x, y };
      }
      const { width: canvasWidth, height: canvasHeight } = canvas.getBoundingClientRect();
      const minX = CANVAS_PADDING;
      const minY = CANVAS_PADDING;
      const maxX = Math.max(minX, canvasWidth - width - CANVAS_PADDING);
      const maxY = Math.max(minY, canvasHeight - height - CANVAS_PADDING);
      return {
        x: Math.min(Math.max(minX, x), maxX),
        y: Math.min(Math.max(minY, y), maxY)
      };
    },
    []
  );

  const clampOverlayPosition = useCallback((x: number, y: number, width: number, height: number) => {
    const stage = stageRef.current;
    if (!stage) {
      return { x, y };
    }
    const { width: stageWidth, height: stageHeight } = stage.getBoundingClientRect();
    const minX = 8;
    const minY = 8;
    const maxX = Math.max(minX, stageWidth - width - 8);
    const maxY = Math.max(minY, stageHeight - height - 8);
    return {
      x: Math.min(Math.max(minX, x), maxX),
      y: Math.min(Math.max(minY, y), maxY)
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const rawX = event.clientX - dragging.offsetX - canvasRect.left;
      const rawY = event.clientY - dragging.offsetY - canvasRect.top;
      const { x, y } = clampPosition(rawX, rawY, dragging.width, dragging.height);
      setWindows((prev: DesktopWindow[]) =>
        prev.map((windowItem: DesktopWindow) =>
          windowItem.id === dragging.id
            ? {
                ...windowItem,
                x,
                y
              }
            : windowItem
        )
      );
    },
    [dragging, clampPosition, setWindows]
  );

  useEffect(() => {
    const handlePointerUp = () => setDragging(null);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove]);

  useEffect(() => {
    if (!resizingWindow) {
      return;
    }
    const handleResizeMove = (event: PointerEvent) => {
      if (event.pointerId !== resizingWindow.pointerId) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const canvasRect = canvas.getBoundingClientRect();
      const pointerX = event.clientX - canvasRect.left;
      const pointerY = event.clientY - canvasRect.top;
      const maxWidth = Math.max(MIN_WINDOW_WIDTH, canvasRect.width - resizingWindow.x - CANVAS_PADDING);
      const maxHeight = Math.max(MIN_WINDOW_HEIGHT, canvasRect.height - resizingWindow.y - CANVAS_PADDING);
      let width = resizingWindow.startWidth + (pointerX - resizingWindow.startPointerX);
      let height = resizingWindow.startHeight + (pointerY - resizingWindow.startPointerY);
      width = Math.max(MIN_WINDOW_WIDTH, Math.min(width, maxWidth));
      height = Math.max(MIN_WINDOW_HEIGHT, Math.min(height, maxHeight));
      const timestamp = new Date().toISOString();
      setWindows((prev: DesktopWindow[]) =>
        prev.map((item) =>
          item.id === resizingWindow.id
            ? {
                ...item,
                width,
                height,
                updatedAt: timestamp
              }
            : item
        )
      );
    };
    const handleResizeUp = (event: PointerEvent) => {
      if (event.pointerId === resizingWindow.pointerId) {
        setResizingWindow(null);
      }
    };
    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeUp);
    window.addEventListener('pointercancel', handleResizeUp);
    return () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeUp);
      window.removeEventListener('pointercancel', handleResizeUp);
    };
  }, [resizingWindow, setWindows]);

  useEffect(() => {
    if (!overlayInteraction) {
      return;
    }
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const handleOverlayMove = (event: PointerEvent) => {
      if (event.pointerId !== overlayInteraction.pointerId) {
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      setOverlayLayouts((prev) => {
        const current = prev[overlayInteraction.key];
        if (!current) {
          return prev;
        }
        if (overlayInteraction.type === 'move') {
          const rawX = event.clientX - overlayInteraction.offsetX - stageRect.left;
          const rawY = event.clientY - overlayInteraction.offsetY - stageRect.top;
          const { x, y } = clampOverlayPosition(rawX, rawY, current.width, current.height);
          if (x === current.x && y === current.y) {
            return prev;
          }
          return {
            ...prev,
            [overlayInteraction.key]: {
              ...current,
              x,
              y
            }
          };
        }
        const pointerX = event.clientX - stageRect.left;
        const pointerY = event.clientY - stageRect.top;
        let width = overlayInteraction.startWidth + (pointerX - overlayInteraction.startPointerX);
        let height = overlayInteraction.startHeight + (pointerY - overlayInteraction.startPointerY);
        const maxWidth = stageRect.width - current.x - 8;
        const maxHeight = stageRect.height - current.y - 8;
        width = Math.max(MIN_OVERLAY_WIDTH, Math.min(width, maxWidth));
        height = Math.max(MIN_OVERLAY_HEIGHT, Math.min(height, maxHeight));
        if (width === current.width && height === current.height) {
          return prev;
        }
        return {
          ...prev,
          [overlayInteraction.key]: {
            ...current,
            width,
            height
          }
        };
      });
    };
    const handleOverlayUp = (event: PointerEvent) => {
      if (event.pointerId === overlayInteraction.pointerId) {
        setOverlayInteraction(null);
      }
    };
    window.addEventListener('pointermove', handleOverlayMove);
    window.addEventListener('pointerup', handleOverlayUp);
    window.addEventListener('pointercancel', handleOverlayUp);
    return () => {
      window.removeEventListener('pointermove', handleOverlayMove);
      window.removeEventListener('pointerup', handleOverlayUp);
      window.removeEventListener('pointercancel', handleOverlayUp);
    };
  }, [clampOverlayPosition, overlayInteraction]);

  useEffect(() => {
    const handleResize = () => {
      setOverlayLayouts((prev) => {
        let mutated = false;
        const next = { ...prev } as Record<OverlayKey, OverlayLayout>;
        (Object.keys(prev) as OverlayKey[]).forEach((key) => {
          const layout = prev[key];
          const { x, y } = clampOverlayPosition(layout.x, layout.y, layout.width, layout.height);
          if (x !== layout.x || y !== layout.y) {
            mutated = true;
            next[key] = { ...layout, x, y };
          }
        });
        return mutated ? next : prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampOverlayPosition]);

  const createWindow = () => {
    const canvas = canvasRef.current;
    const bounds = canvas?.getBoundingClientRect();
    const width = bounds?.width ?? 640;
    const height = bounds?.height ?? 420;
    const randomX = CANVAS_PADDING + Math.random() * Math.max(0, width - WINDOW_WIDTH - CANVAS_PADDING * 2);
    const randomY = CANVAS_PADDING + Math.random() * Math.max(0, height - WINDOW_HEIGHT - CANVAS_PADDING * 2);
    const origin = autoStack
      ? { x: randomX, y: randomY }
      : { x: CANVAS_PADDING + windows.length * 24, y: CANVAS_PADDING + windows.length * 24 };
    const { x, y } = clampPosition(origin.x, origin.y);
    const timestamp = new Date().toISOString();
    const next: DesktopWindow = {
      id: crypto.randomUUID(),
      title: draftTitle || `Window ${windows.length + 1}`,
      notes: 'Log your references here.',
      image: null,
      imageName: undefined,
      activeTab: 'image',
      createdAt: timestamp,
      updatedAt: timestamp,
      x,
      y,
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT
    };
    setWindows([next, ...windows]);
    setDraftTitle('New ref');
    setActiveWindow(next.id);
  };

  const applyWindowUpdate = useCallback(
    (id: string, updates: Partial<DesktopWindow>) => {
      setWindows((prev: DesktopWindow[]) =>
        prev.map((item: DesktopWindow) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                updatedAt: updates.updatedAt ?? new Date().toISOString()
              }
            : item
        )
      );
    },
    [setWindows]
  );

  const handleTabSelect = (id: string, tab: WindowTab) => applyWindowUpdate(id, { activeTab: tab });

  const handleNotesChange = (id: string, value: string) => applyWindowUpdate(id, { notes: value });

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });

  const openFilePicker = (id: string) => {
    fileInputsRef.current[id]?.click();
  };

  const handleImageUpload = (id: string, file?: File) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [id]: true }));
    readFileAsDataUrl(file)
      .then((data) => {
        applyWindowUpdate(id, { image: data, imageName: file.name, activeTab: 'image' });
      })
      .finally(() => {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, windowItem: DesktopWindow) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      return;
    }
    if (!canvasRef.current) return;
    const windowRect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!windowRect) return;
    const offsetX = event.clientX - windowRect.left;
    const offsetY = event.clientY - windowRect.top;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setActiveWindow(windowItem.id);
    setDragging({
      id: windowItem.id,
      offsetX,
      offsetY,
      pointerId: event.pointerId,
      width: windowRect.width || WINDOW_WIDTH,
      height: windowRect.height || WINDOW_HEIGHT
    });
  };

  const handleOverlayPointerDown = (event: React.PointerEvent<HTMLDivElement>, key: OverlayKey) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      return;
    }
    event.preventDefault();
    const element = event.currentTarget.closest('.upload-overlay-window') as HTMLDivElement | null;
    if (!element || !stageRef.current) {
      return;
    }
    const bounds = element.getBoundingClientRect();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setOverlayInteraction({
      type: 'move',
      key,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      pointerId: event.pointerId,
      width: bounds.width,
      height: bounds.height
    });
  };

  const handleOverlayResizePointerDown = (event: React.PointerEvent<HTMLDivElement>, key: OverlayKey) => {
    event.preventDefault();
    event.stopPropagation();
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const container = event.currentTarget.closest('.upload-overlay-window') as HTMLDivElement | null;
    if (!container) {
      return;
    }
    const bounds = container.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setOverlayInteraction({
      type: 'resize',
      key,
      pointerId: event.pointerId,
      startPointerX: event.clientX - stageRect.left,
      startPointerY: event.clientY - stageRect.top,
      startWidth: bounds.width,
      startHeight: bounds.height
    });
  };

  const getOverlayStyle = (key: OverlayKey) => ({
    left: overlayLayouts[key].x,
    top: overlayLayouts[key].y,
    width: overlayLayouts[key].width,
    height: overlayLayouts[key].height
  });

  const handleWindowResizePointerDown = (event: React.PointerEvent<HTMLDivElement>, windowItem: DesktopWindow) => {
    event.preventDefault();
    event.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const canvasRect = canvas.getBoundingClientRect();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setActiveWindow(windowItem.id);
    setResizingWindow({
      id: windowItem.id,
      pointerId: event.pointerId,
      startPointerX: event.clientX - canvasRect.left,
      startPointerY: event.clientY - canvasRect.top,
      startWidth: windowItem.width,
      startHeight: windowItem.height,
      x: windowItem.x,
      y: windowItem.y
    });
  };

  return (
    <section className="upload-desktop-full" ref={stageRef}>
      {showInfoWindow && (
        <div
          className="upload-overlay-window upload-overlay-window--info win95-window"
          style={getOverlayStyle('info')}
        >
          <div
            className="win95-titlebar"
            style={{ touchAction: 'none' }}
            onPointerDown={(event) => handleOverlayPointerDown(event, 'info')}
          >
            <span>Desktop brief</span>
            <button className="history-jump" onClick={() => setShowInfoWindow(false)}>
              ✕
            </button>
          </div>
          <div className="upload-overlay-body text-[#0b1538]">
            <p className="upload-desktop-hero__eyebrow">Image desktop</p>
            <h1 className="upload-overlay-headline">Reference windows that behave</h1>
            <p>Stack draggable cards across the canvas, toggle the retro grid, and decide whether to persist between visits.</p>
          </div>
          <div
            className="upload-overlay-resizer"
            style={{ touchAction: 'none' }}
            onPointerDown={(event) => handleOverlayResizePointerDown(event, 'info')}
          />
        </div>
      )}
      {showControlsWindow && (
        <div
          className="upload-overlay-window upload-overlay-window--controls win95-window"
          style={getOverlayStyle('controls')}
        >
          <div
            className="win95-titlebar"
            style={{ touchAction: 'none' }}
            onPointerDown={(event) => handleOverlayPointerDown(event, 'controls')}
          >
            <span>Window controls</span>
            <button className="history-jump" onClick={() => setShowControlsWindow(false)}>
              ✕
            </button>
          </div>
          <div className="upload-overlay-body space-y-4 text-sm text-[#111]">
            <div className="space-y-2">
              <label className="text-sm text-[#333]">Window label</label>
              <div className="flex flex-col gap-2">
                <Input value={draftTitle} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraftTitle(event.target.value)} />
                <Button onClick={createWindow}>Launch</Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-4 win95-panel text-sm text-[#111]">
                Auto-stack
                <Switch checked={autoStack} onCheckedChange={setAutoStack} />
              </label>
              <label className="flex items-center justify-between gap-4 win95-panel text-sm text-[#111]">
                Show grid
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </label>
              <label className="flex items-center justify-between gap-4 win95-panel text-sm text-[#111]">
                Persist
                <Switch checked={persist} onCheckedChange={setPersist} />
              </label>
            </div>
            <p className="text-xs text-[#333]">
              Drag each window anywhere. Tabs keep uploads, notes, and timestamps organized like a Win95 desktop.
            </p>
          </div>
          <div
            className="upload-overlay-resizer"
            style={{ touchAction: 'none' }}
            onPointerDown={(event) => handleOverlayResizePointerDown(event, 'controls')}
          />
        </div>
      )}
      {(!showInfoWindow || !showControlsWindow) && (
        <div className="upload-overlay-launchers">
          {!showInfoWindow && (
            <button type="button" className="upload-launcher" onClick={() => setShowInfoWindow(true)}>
              Open brief
            </button>
          )}
          {!showControlsWindow && (
            <button type="button" className="upload-launcher" onClick={() => setShowControlsWindow(true)}>
              Open controls
            </button>
          )}
        </div>
      )}
      <div
        ref={canvasRef}
        className="upload-desktop-canvas upload-desktop-canvas--fullscreen relative bg-[#047272] text-[#111]"
        style={{
          backgroundImage: showGrid
            ? 'linear-gradient(transparent 95%, rgba(0,0,0,0.25) 95%), linear-gradient(90deg, transparent 95%, rgba(0,0,0,0.25) 95%)'
            : undefined,
          backgroundSize: showGrid ? '40px 40px' : undefined
        }}
      >
        {windows.map((windowItem: DesktopWindow) => (
          <div
            key={windowItem.id}
            className="upload-desktop-window win95-window"
            style={{
              left: windowItem.x,
              top: windowItem.y,
              width: windowItem.width,
              height: windowItem.height,
              zIndex: activeWindow === windowItem.id ? 20 : 10
            }}
          >
            <div className="win95-titlebar cursor-grab" onPointerDown={(event) => handlePointerDown(event, windowItem)}>
              <span>{windowItem.title}</span>
              <button
                className="history-jump"
                onClick={() =>
                  setWindows((prev: DesktopWindow[]) => prev.filter((entry: DesktopWindow) => entry.id !== windowItem.id))
                }
              >
                ✕
              </button>
            </div>
            <div className="upload-desktop-window__body border-t-2 border-[#050b4a] bg-[#fdfdfd] p-3 text-sm text-[#111] flex flex-col">
              <div className="mb-3 flex gap-1">
                {WINDOW_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      'flex-1 border-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide',
                      windowItem.activeTab === tab.key
                        ? 'bg-[#050b4a] text-white border-[#050b4a]'
                        : 'bg-white text-[#050b4a] border-[#050b4a]'
                    )}
                    onClick={() => handleTabSelect(windowItem.id, tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {windowItem.activeTab === 'image' && (
                <div className="flex flex-1 flex-col gap-2">
                  <div
                    className="desktop-window-image"
                    role="button"
                    tabIndex={0}
                    aria-label={windowItem.image ? 'Replace image' : 'Attach image'}
                    onClick={() => openFilePicker(windowItem.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openFilePicker(windowItem.id);
                      }
                    }}
                  >
                    {windowItem.image ? (
                      <img src={windowItem.image} alt={windowItem.title} className="desktop-window-image__img" />
                    ) : (
                      <div className="desktop-window-image__empty">
                        <p>Tap to pin an image to this reference.</p>
                      </div>
                    )}
                    <div className="desktop-window-image__meta">
                      {uploading[windowItem.id] ? 'Uploading…' : windowItem.imageName || 'Ready for a drop'}
                    </div>
                    <button
                      type="button"
                      className="desktop-window-image__chip"
                      onClick={(event) => {
                        event.stopPropagation();
                        openFilePicker(windowItem.id);
                      }}
                    >
                      {windowItem.image ? 'Replace' : 'Attach'}
                    </button>
                  </div>
                  <input
                    ref={(node) => {
                      if (node) {
                        fileInputsRef.current[windowItem.id] = node;
                      } else {
                        delete fileInputsRef.current[windowItem.id];
                      }
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImageUpload(windowItem.id, event.target.files?.[0])}
                  />
                </div>
              )}
              {windowItem.activeTab === 'notes' && (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#444]">Notes</label>
                  <textarea
                    className="w-full border-2 border-[#050b4a] bg-white p-2 text-sm text-[#111]"
                    rows={5}
                    value={windowItem.notes}
                    onChange={(event) => handleNotesChange(windowItem.id, event.target.value)}
                  />
                </div>
              )}
              {windowItem.activeTab === 'details' && (
                <div className="space-y-2 text-xs">
                  <p>
                    Created <strong>{new Date(windowItem.createdAt).toLocaleString()}</strong>
                  </p>
                  <p>
                    Updated <strong>{new Date(windowItem.updatedAt).toLocaleString()}</strong>
                  </p>
                  <p>
                    Grid pins persist <strong>{persist ? 'between visits' : 'for this session only'}</strong>.
                  </p>
                </div>
              )}
            </div>
            <div
              className="desktop-window-resizer"
              style={{ touchAction: 'none' }}
              onPointerDown={(event) => handleWindowResizePointerDown(event, windowItem)}
            />
          </div>
        ))}
        {!windows.length && <p className="p-6 text-center text-sm text-[#111]">Launch a window to start your desk.</p>}
      </div>
    </section>
  );
};
