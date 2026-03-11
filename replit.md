# Workspace

## Overview

pnpm workspace monorepo using TypeScript. CVA Coffee Cupping app for the SCA Cupping Value Assessment protocol.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
└── ...
```

## App Features

### CVA Coffee Cupping App (Mobile)

A mobile app for recording SCA CVA (Coffee Value Assessment) cupping sessions with:
- Full 6-step cupping form following SCA CVA protocol
- Score sliders (6.00–10.00 in 0.25 steps) for: Fragrance/Aroma, Flavor, Aftertaste, Acidity, Body, Balance, Overall
- Intensity indicators (0-5) for key attributes
- Boolean per-cup scoring (5 cups × 2 pts each) for: Uniformity, Clean Cup, Sweetness
- Defect tracking (Taints: 2pts, Faults: 4pts)
- Automatic final score calculation
- Session history list with score color-coding
- Detail view with all attribute breakdown
- Edit and delete sessions
- Persistence via PostgreSQL

### API Endpoints

- `GET /api/cuppings` — List all cupping sessions
- `POST /api/cuppings` — Create new cupping session
- `GET /api/cuppings/:id` — Get specific session
- `PUT /api/cuppings/:id` — Update session
- `DELETE /api/cuppings/:id` — Delete session

## Color Palette

Warm coffee-inspired palette:
- Primary: `#C87941` (caramel)
- Background: `#F5F0EB` (off-white)
- Text: `#1C1008` (dark brown)
- Cards: `#FFFFFF`

## Database Schema

`cuppings` table with all CVA protocol fields stored as JSONB for flexible attribute scoring.
