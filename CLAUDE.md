# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (type-checks + compiles)
npm run lint     # ESLint via next lint
npm run start    # Serve production build
```

There is no test suite configured. TypeScript type errors surface during `npm run build`.

## Architecture

VibeMap is a Next.js 14 App Router app. All pages are client components (`"use client"`) because the quiz and results rely on browser state.

### Data flow

```
Quiz answers (useState)
  → buildProfile()       src/lib/buildProfile.ts
  → VibeProfile          src/types/index.ts
  → sessionStorage       (handoff between /quiz and /results routes)
  → matchNeighborhoods() src/lib/matching.ts
  → NeighborhoodMatch[]  rendered in /results
```

### Core abstractions

**`VibeProfile`** (`src/types/index.ts`) — the shared language between users and neighborhoods. An object with 8 numeric dimensions (0–10): `social`, `noise`, `urban`, `walkability`, `nightlife`, `outdoors`, `diversity`, `budget`. Every quiz question and every neighborhood entry speaks this same schema.

**Quiz questions** (`src/data/questions.ts`) — each question has a `mapping(answer) => Partial<VibeProfile>` function. Multiple questions can contribute to the same dimension; `buildProfile()` averages all contributions per dimension.

**Matching** (`src/lib/matching.ts`) — weighted inverted-distance similarity. Each dimension score = `1 - |userVal - hoodVal| / 10`. Scores are multiplied by `WEIGHTS` (which sum to 1.0) and converted to a 0–100 integer. To tune matching behaviour, adjust `WEIGHTS` in that file.

**Neighborhood data** (`src/data/neighborhoods.ts`) — 25 mock entries. Each has a `vibe: VibeProfile` and an `image` field which is a Tailwind gradient class string (e.g. `"from-purple-500 to-pink-500"`) used as the card's color banner.

### Styling conventions

- Tailwind utility classes throughout; no CSS modules.
- Custom CSS animations are defined inline via `<style jsx global>` in page files rather than in `globals.css`.
- `clsx` is used for conditional class merging.
- Brand colors are in `tailwind.config.ts` under `colors.brand` and `colors.accent`.
- The custom range input slider style lives in `globals.css`.

### Adding a new neighborhood

Add an entry to the `neighborhoods` array in `src/data/neighborhoods.ts` following the existing shape. The `image` field must be a valid Tailwind `bg-gradient-to-r` pair (e.g. `"from-sky-400 to-blue-500"`).

### Adding a new quiz question

Add a `QuizQuestion` object to `src/data/questions.ts`. The `mapping` function must return `Partial<VibeProfile>` — only include dimensions the question actually affects. `buildProfile()` will automatically average it in.
