import React, { CSSProperties } from 'react';

const CAST = [
  {
    id: 'larry',
    name: 'Larry',
    tagline: 'Meticulous field mentor',
    description: 'Keeps the portal squad patient and steady. Larry logs every breadcrumb so no one gets lost twice.',
    accent: '#dbe6ff',
    image: '/media/larry.png',
    link: 'https://x.com/holovilleMentor',
    note: 'Field notes 7B',
    personality: 'Keeps the task list tidy and the squad steady.',
    theme: 'Management cadence',
    effect: 'manage'
  },
  {
    id: 'guy',
    name: 'Guy',
    tagline: 'Resident stylist',
    description: 'Paints warmth onto every console and door frame. Guy can repaint a whole room faster than we can brew tea.',
    accent: '#ffd1da',
    image: '/media/guy.png',
    link: 'https://x.com/monoRedguy',
    note: 'Palette swaps',
    personality: 'Sketches fresh lines on every wall.',
    theme: 'Drawing rituals',
    effect: 'draw'
  },
  {
    id: 'gary',
    name: 'Gary',
    tagline: 'Quiet strategy brain',
    description: 'Keeps the spreadsheets, the lore, and the snacks. Expect gentle reminders delivered with very big glasses.',
    accent: '#f1d1c5',
    image: '/media/gary.png',
    link: 'https://x.com/shrewdLibrarian',
    note: 'Strategy stack',
    personality: 'Catalogs lore and snacks with equal care.',
    theme: 'Library pulse',
    effect: 'library'
  },
  {
    id: 'joey',
    name: 'Joey',
    tagline: 'Courier of good news',
    description: 'Sprints between zones delivering doodles and fresh jokes. Joey never forgets to wave on the way out.',
    accent: '#d8fad1',
    image: '/media/joey.png',
    link: 'https://x.com/dottyBanker',
    note: 'Parcel sprint',
    personality: 'Leaves giggles and neon notes everywhere.',
    theme: 'Playful sparks',
    effect: 'fun'
  }
] as const;

type Character = (typeof CAST)[number];

type CharacterStyle = CSSProperties & {
  '--character-accent'?: string;
};

const cardStyle = (character: Character): CharacterStyle => ({
  '--character-accent': character.accent
});

export const CharactersPage: React.FC = () => {
  return (
    <div className="characters-board">
      <header className="characters-header">
        <p className="characters-eyebrow">Meet the portal regulars</p>
        <h1>Characters</h1>
        <p>
          They keep Holoscape playful. Hover over each friend to trigger their holographic photo booth and read the latest signal.
        </p>
      </header>
      <section className="characters-grid">
        {CAST.map((character) => (
          <article key={character.id} className="character-card" style={cardStyle(character)} data-effect={character.effect}>
            <span className="character-card__tape" aria-hidden="true" />
            <span className="character-card__doodle character-card__doodle--left" aria-hidden="true" />
            <span className="character-card__doodle character-card__doodle--right" aria-hidden="true" />
            <div className="character-note">{character.note}</div>
            <div className="character-photo">
              <span className="character-photo__shape character-photo__shape--primary" aria-hidden="true" />
              <span className="character-photo__shape character-photo__shape--secondary" aria-hidden="true" />
              <img src={character.image} alt={`${character.name} portrait`} loading="lazy" />
            </div>
            <h2 className="character-name">{character.name}</h2>
            <p className="character-tagline">{character.tagline}</p>
            <p className="character-copy">{character.description}</p>
            <p className="character-theme">{character.theme}</p>
            <p className="character-personality" aria-live="polite">{character.personality}</p>
            <a className="character-link" href={character.link} target="_blank" rel="noreferrer">
              Say hi ↗
            </a>
          </article>
        ))}
      </section>
    </div>
  );
};
