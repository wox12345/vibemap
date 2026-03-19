# VibeMap

**Neighborhood vibe matching for people looking to buy or move.**

Match yourself to neighborhoods based on lifestyle, personality, and preferences — not just price or location.

---

## Quick Start

You need **Node.js 18+** installed.

```bash
cd vibemap
npm install        # or: bun install / pnpm install
npm run dev        # starts at http://localhost:3000
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

```
vibemap/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── quiz/page.tsx         # 10-step onboarding quiz
│   │   ├── results/page.tsx      # Match results page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Quiz/
│   │   │   ├── ProgressBar.tsx   # Step progress indicator
│   │   │   ├── SliderQuestion.tsx
│   │   │   └── ChoiceQuestion.tsx
│   │   └── Results/
│   │       ├── NeighborhoodCard.tsx
│   │       └── MatchScore.tsx    # Animated circular score
│   ├── data/
│   │   ├── neighborhoods.ts      # 25 mock neighborhoods
│   │   └── questions.ts          # 10 quiz questions with mappings
│   ├── lib/
│   │   ├── matching.ts           # Weighted similarity algorithm
│   │   └── buildProfile.ts       # Aggregates quiz answers → VibeProfile
│   └── types/index.ts            # Shared TypeScript types
├── package.json
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## How It Works

### 1. Quiz → VibeProfile
Each question has a `mapping()` function that converts the raw answer into partial `VibeProfile` dimensions (0–10 scale). After all 10 questions, `buildProfile()` averages contributions per dimension to produce a final profile across 8 axes:

| Dimension    | Meaning                          |
|-------------|----------------------------------|
| `social`    | Introvert → Extrovert            |
| `noise`     | Quiet seeker → Noise lover       |
| `urban`     | Suburban/rural → Dense urban     |
| `walkability` | Car-dependent → Car-free        |
| `nightlife` | Early nights → Night owl         |
| `outdoors`  | Indoor person → Nature lover     |
| `diversity` | Homogeneous → Multicultural      |
| `budget`    | Budget → Premium                 |

### 2. Matching Algorithm
`matchNeighborhoods()` scores every neighborhood against the user profile using **weighted per-dimension similarity**. Each dimension gets an inverted-distance score (0–1), multiplied by its weight, summed to produce a 0–100 match percentage.

### 3. Results
Top 5 matches are shown with:
- Animated match score ring
- Auto-generated plain-English headline
- Key stats (median price, walkability, rent)
- Expandable vibe breakdown bars
- Save / bookmark toggle
- "People like you also liked" section

---

## Scaling to Production

| Feature | API to use |
|---------|-----------|
| Real home prices | Zillow API / Redfin API |
| Walkability scores | Walk Score API |
| Points of interest | Google Places API |
| Demographics & diversity | US Census Bureau API |
| Neighborhood boundaries | Mapbox or Google Maps API |
| User accounts / saves | Supabase or Firebase |
| Map view toggle | Mapbox GL JS or react-map-gl |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: CSS keyframes (no extra deps)
- **Icons**: Lucide React
- **Data**: Mock JSON (no database)
- **State**: React `useState` + `sessionStorage` for quiz→results handoff
