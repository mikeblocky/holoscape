import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getPresetUser } from '@/data/presetUsers';

export const MysteryPage: React.FC = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const handle = params.get('user') ?? '';
  const preset = handle ? getPresetUser(handle) : undefined;
  const alias = preset?.data.displayName ?? 'Unknown Operative';
  const visual = preset?.asset ?? '/media/SEEK_THE_FOREST_1.gif';

  return (
    <section className="mystery-stage">
      <div className="mystery-glow">
        <div className="mystery-visor">
          <img src={visual} alt="Encrypted transmission" />
        </div>
        <div className="mystery-copy">
          <p className="mystery-eyebrow">Encrypted transmission</p>
          <h1>Access granted, {alias}</h1>
          <p>
            You tripped the classified route reserved for the mystery roster. Stay quiet, observe carefully, and remember you
            can always duck back to the public desktop if things get too strange.
          </p>
          <div className="mystery-actions">
            <Link to="/" className="win95-btn">
              Return home
            </Link>
            <Link to="/auth" className="win95-btn">
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
