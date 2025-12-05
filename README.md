# holoscape (React edition)

Holoscape now runs on a single-page React surface with shadcn/ui primitives, Tailwind CSS, and a dedicated taskbar theme system. Legacy HTML/CSS assets were removed in favor of composable pages (Dashboard, Gallery, Upload Desk, Calendar, Clock, Settings) that store their state locally.

## Project layout

- `src/` – React source files (pages, feature components, hooks, shadcn/ui primitives, theme context).
- `public/media` – local reference assets surfaced by the new UI.
- `server.js` – Express API used for `/api/posts` and to serve `dist/` in production.
- `posts.json` – simple JSON store that backs the Express endpoints.

## Available scripts

| Command | Description |
| --- | --- |
| `npm install` | Install both client + server dependencies. |
| `npm run dev` | Start Vite (React app). API calls are proxied to `localhost:3000`. |
| `npm start` | Run the Express server to serve `dist/` (build first). |
| `npm run build` | Type-check and produce the production bundle under `dist/`. |
| `npm run preview` | Preview the built bundle via Vite. |
| `npm run typecheck` | Run TypeScript without emitting files. |

## Development notes

- Taskbar theming is scoped to the navigation bezel and buttons only. Background gradients never change, so accessible contrast stays predictable.
- Gallery, Upload Desk, Calendar, and Clock experiences persist to `localStorage`. Clearing browser storage resets them instantly.
- To ship the React build through Express: `npm run build` followed by `npm start`. Express will serve `dist/index.html` as a fallback for all non-API routes.
