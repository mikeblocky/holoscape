import React from 'react';
import { GalleryBoard } from '@/components/gallery/GalleryBoard';

export const GalleryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Holoscape gallery</p>
        <h1 className="text-3xl font-heading text-[#111]">Drop files, build a mood</h1>
        <p className="text-[#333]">Snippets stay in localStorage so nothing touches the network.</p>
      </header>
      <GalleryBoard />
    </div>
  );
};
