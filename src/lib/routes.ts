export type AppRoute = {
  label: string;
  path: string;
};

export const APP_ROUTES: AppRoute[] = [
  { label: 'Home', path: '/' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Upload Desk', path: '/upload' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Clock', path: '/clock' },
  { label: 'Settings', path: '/settings' },
  { label: 'Auth', path: '/auth' },
  { label: 'Characters', path: '/characters' }
];

const routeMap = APP_ROUTES.reduce<Record<string, string>>((acc, route) => {
  acc[route.path] = route.label;
  return acc;
}, {});

export const getRouteLabel = (path: string) => routeMap[path] ?? path;
