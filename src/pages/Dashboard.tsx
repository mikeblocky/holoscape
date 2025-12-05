import React from 'react';
import { Link } from 'react-router-dom';

const palettePanels = [
  {
    id: 'larry',
    title: 'Larry tone',
    blurb: 'Keep us steady with the clock + calendar combo.',
    link: '/calendar',
    linkLabel: 'Plan something',
    color: 'palette-larry'
  },
  {
    id: 'guy',
    title: 'Guy tone',
    blurb: 'Style the Upload Desk and drop references everywhere.',
    link: '/upload',
    linkLabel: 'Open image desktop',
    color: 'palette-guy'
  },
  {
    id: 'gary',
    title: 'Gary tone',
    blurb: 'Keep the gallery tidy and log bright palettes.',
    link: '/gallery',
    linkLabel: 'View gallery',
    color: 'palette-gary'
  },
  {
    id: 'joey',
    title: 'Joey tone',
    blurb: 'Launch timers, watchers, and flyouts from the clock.',
    link: '/clock',
    linkLabel: 'Launch clock',
    color: 'palette-joey'
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-stack">
      <section className="portal-card">
        <h1 className="portal-title">Welcome to holoscape portal</h1>
        <p className="portal-subtitle">
          What you do here isn&rsquo;t matter, so feel free to do anything here. Take a look! This website is created by{' '}
          <a href="https://github.com/mikeblocky" target="_blank" rel="noreferrer">
            me! (mikeblocky).
          </a>
        </p>
        <div className="portal-divider" />
        <div className="portal-section">
          <h2>Quick actions</h2>
          <p>Pick any zone below or hop straight into the image desktop.</p>
          <Link to="/upload" className="portal-cta">
            Upload work to make it like a desktop
          </Link>
        </div>
      </section>
      <section className="palette-grid">
        {palettePanels.map((panel) => (
          <article key={panel.id} className={['palette-card', panel.color].join(' ')}>
            <p className="palette-label">{panel.title}</p>
            <p className="palette-body">{panel.blurb}</p>
            <Link to={panel.link} className="palette-link">
              {panel.linkLabel}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
};
