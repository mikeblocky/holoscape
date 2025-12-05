import React from 'react';
import { Link } from 'react-router-dom';
import { type TaskbarTheme, useTaskbarTheme } from '@/theme/TaskbarThemeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNavigationHistory } from '@/context/NavigationHistoryProvider';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/context/AuthSessionProvider';

export const SettingsPage: React.FC = () => {
  const { accent, options, setAccent } = useTaskbarTheme();
  const [classicTaskbar, setClassicTaskbar] = useLocalStorage('holoscape:prefs:classicTaskbar', true);
  const [glassOverlay, setGlassOverlay] = useLocalStorage('holoscape:prefs:glassOverlay', false);
  const [showHistory, setShowHistory] = useLocalStorage('holoscape:prefs:showHistory', true);
  const { history, clearHistory } = useNavigationHistory();
  const { user, logout } = useAuthSession();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Settings</p>
        <h1 className="text-3xl font-heading text-[#111]">Tune the taskbar</h1>
        <p className="text-[#333]">Blend the Win95 chrome with the glassy overlay, tune navigation memory, and reskin the taskbar.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Accent palette</CardTitle>
          <CardDescription>Select a swatch to recolor the chrome.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {options.map((option: TaskbarTheme) => (
              <button
                key={option.value}
                className={cn('win95-accent-chip', option.value === accent && 'is-active')}
                style={{ backgroundColor: option.value }}
                onClick={() => setAccent(option.value)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Workspace options</CardTitle>
          <CardDescription>Toggle the modern/classic blend and overlays.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="settings-toggle">
            <span>
              Classic taskbar blend
              <p>Uses the glossy gradient version of the taskbar.</p>
            </span>
            <Switch checked={classicTaskbar} onCheckedChange={setClassicTaskbar} />
          </label>
          <label className="settings-toggle">
            <span>
              Glass overlay
              <p>Adds a faint neon grid over the teal desktop.</p>
            </span>
            <Switch checked={glassOverlay} onCheckedChange={setGlassOverlay} />
          </label>
          <label className="settings-toggle">
            <span>
              Show navigation history
              <p>Displays the journey widget on the dashboard hero.</p>
            </span>
            <Switch checked={showHistory} onCheckedChange={setShowHistory} />
          </label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Navigation history</CardTitle>
          <CardDescription>Holoscape keeps the last ten waypoints locally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length ? (
            <ul className="space-y-2 text-sm">
              {history.map((entry) => (
                <li key={`${entry.path}-${entry.timestamp}`} className="flex items-center justify-between rounded border border-[#b0b0b0] bg-white px-3 py-2">
                  <span className="font-semibold text-[#111]">{entry.label}</span>
                  <span className="text-xs text-[#666]">{new Date(entry.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#555]">History log is empty.</p>
          )}
          <Button variant="subtle" onClick={clearHistory} disabled={!history.length}>
            Clear history
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>View your current badge or sign out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {user ? (
            <>
              <p className="text-sm text-[#333]">
                Signed in as <strong>{user.username}</strong> ({user.displayName})
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="subtle" asChild>
                  <Link to="/account">View account</Link>
                </Button>
                <Button variant="ghost" onClick={logout}>
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#555]">No active account detected.</p>
              <Button variant="subtle" asChild>
                <Link to="/auth">Open auth wall</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
