# financial-app-frontend

Next.js 15 frontend for the Financial App. Uses React 19, TypeScript, Tailwind CSS 4, and shadcn/ui.

## Port: 3000

## Structure

```
app/              ← Next.js App Router pages
components/
  ui/             ← shadcn/ui components
  layout/         ← layout components
  shared/         ← shared components
lib/
  api/            ← all Gateway calls go through here (JWT headers, error handling)
  hooks/          ← custom React hooks
  utils/          ← utility functions
types/            ← TypeScript type definitions
```

## Environment Variables
See `.env.local.example`.

```bash
cp .env.local.example .env.local
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Lint

```bash
npm run lint
```
