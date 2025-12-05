import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { GalleryPage } from '@/pages/Gallery';
import { UploadPage } from '@/pages/Upload';
import { CalendarPage } from '@/pages/Calendar';
import { ClockPage } from '@/pages/Clock';
import { SettingsPage } from '@/pages/Settings';
import { AuthPage } from '@/pages/Auth';
import { CharactersPage } from '@/pages/Characters';
import { MysteryPage } from '@/pages/Mystery';
import { AccountPage } from '@/pages/Account';
import { AppShell } from '@/components/layout/AppShell';
import { TaskbarThemeProvider } from '@/theme/TaskbarThemeProvider';
import { AuthSessionProvider } from '@/context/AuthSessionProvider';
import { NavigationHistoryProvider } from '@/context/NavigationHistoryProvider';

const App: React.FC = () => {
  return (
    <TaskbarThemeProvider>
      <AuthSessionProvider>
        <NavigationHistoryProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/clock" element={<ClockPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/mystery" element={<MysteryPage />} />
            </Routes>
          </AppShell>
        </NavigationHistoryProvider>
      </AuthSessionProvider>
    </TaskbarThemeProvider>
  );
};

export default App;
