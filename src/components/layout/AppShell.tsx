import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTaskbarTheme } from '@/theme/TaskbarThemeProvider';
import { useAuthSession } from '@/context/AuthSessionProvider';

type NavLink = {
  label: string;
  path: string;
  alignRight?: boolean;
};

const BASE_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Clock', path: '/clock' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Image desktop', path: '/upload' },
  { label: 'Settings', path: '/settings' },
  { label: 'Characters', path: '/characters' }
];

export const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname } = useLocation();
  const { accent } = useTaskbarTheme();
  const { user } = useAuthSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isFullBleed = ['/upload', '/auth', '/mystery'].includes(pathname);
  const accountLabel = user ? user.username : 'Account';
  const navLinks: NavLink[] = React.useMemo(
    () => [...BASE_LINKS, { label: accountLabel, path: '/account', alignRight: true }],
    [accountLabel]
  );

  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="portal-shell">
      <header className="retro-nav" style={{ backgroundColor: accent }}>
        <Link to="/" className="retro-logo" aria-label=":D portal home">
          :D
        </Link>
        <button
          className={cn('retro-menu-toggle', menuOpen && 'is-open')}
          type="button"
          aria-label="Toggle navigation menu"
          aria-controls="portal-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="portal-nav" className={cn('retro-links', menuOpen && 'is-open')}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn('retro-link', pathname === link.path && 'is-active')}
              style={link.alignRight ? { marginLeft: 'auto' } : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className={cn('portal-main', isFullBleed && 'portal-main--full')}>{children}</main>
    </div>
  );
};
