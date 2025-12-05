import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/context/AuthSessionProvider';

export const AccountPage: React.FC = () => {
  const { user } = useAuthSession();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-[#333]">Account</p>
        <h1 className="text-3xl font-heading text-[#111]">Account center</h1>
        <p className="text-[#333]">Manage your identity badge, swap users, or head to the auth wall to sign in.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Current holoscape identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <dl className="text-sm text-[#222]">
                <div className="flex items-center justify-between border-b border-dashed border-[#b0b0b0] pb-2">
                  <dt className="font-semibold">Display name</dt>
                  <dd>{user.displayName}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-dashed border-[#b0b0b0] py-2">
                  <dt className="font-semibold">Username</dt>
                  <dd>{user.username}</dd>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <dt className="font-semibold">Access tier</dt>
                  <dd>{user.special ? 'Special route' : 'Standard portal'}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3">
                <Button variant="subtle" asChild>
                  <Link to="/settings">Open settings</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Switch user</Link>
                </Button>
              </div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#5f5f5f]">Log out is located inside settings.</p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#333]">No account is active. Launch the auth wall to sign in or create a badge.</p>
              <Button asChild>
                <Link to="/auth">Go to auth wall</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
