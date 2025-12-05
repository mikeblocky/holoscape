import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

type GalleryItem = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  palette: string;
};

const PALETTE = ['#6f5bff', '#3dd8ff', '#ffb347', '#ff6ad5'];

export const GalleryBoard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useLocalStorage<GalleryItem[]>('holoscape:gallery', []);
  const [status, setStatus] = useState<string | null>(null);

  const addItem = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('Only image files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const palette = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      setItems([
        {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^.]+$/, ''),
          url: reader.result as string,
          palette,
          createdAt: new Date().toISOString()
        },
        ...items
      ]);
      setStatus(`Added ${file.name}`);
    };
    reader.readAsDataURL(file);
  }, [items, setItems]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) addItem(file);
  }, [addItem]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) addItem(file);
  }, [addItem]);

  const stats = useMemo(() => ({
    total: items.length,
    newest: items[0]?.title ?? '—'
  }), [items]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Compose</CardTitle>
          <CardDescription>Drop artwork into the tray or upload manually. Everything stays in your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-[#404040] bg-[#dcdcdc] p-8 text-center"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <p className="text-[#333]">Drag images here or</p>
            <Button className="mt-4" variant="subtle" onClick={() => fileInputRef.current?.click()}>
              Browse files
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            {status && <p className="mt-4 text-sm text-[#333]">{status}</p>}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-6 text-sm text-[#333] md:grid-cols-3">
            <div>
              <dt>Total captures</dt>
              <dd className="text-2xl font-heading text-[#111]">{stats.total}</dd>
            </div>
            <div>
              <dt>Latest title</dt>
              <dd className="text-lg text-[#111]">{stats.newest}</dd>
            </div>
            <div>
              <dt>Palette</dt>
              <dd className="flex gap-2 pt-1">
                {PALETTE.map((color) => (
                  <span key={color} className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item: GalleryItem) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-64 w-full border-b-2 border-[#808080] bg-black">
              <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
              <Badge className="absolute left-4 top-4" style={{ borderColor: item.palette, backgroundColor: '#fff' }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Badge>
            </div>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-heading text-[#111]">{item.title}</h3>
                <button
                  className="text-sm text-[#333] underline"
                  onClick={() => setItems(items.filter((entry: GalleryItem) => entry.id !== item.id))}
                >
                  Remove
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-[#333]">
                <span>Palette</span>
                <span className={cn('h-3 w-16 rounded-full')} style={{ backgroundColor: item.palette }} />
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <Card>
            <CardContent className="py-16 text-center text-[#333]">No captures yet. Drop something luminous.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
