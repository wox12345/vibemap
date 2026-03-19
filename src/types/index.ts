// ─── Vibe Dimensions ─────────────────────────────────────────────────────────
// Every user and neighborhood is described along the same 8 axes (0–10 scale).
export interface VibeProfile {
  social:      number; // 0 = very introverted, 10 = very extroverted
  noise:       number; // 0 = needs quiet,      10 = loves lively/noise
  urban:       number; // 0 = suburban/rural,   10 = dense urban
  walkability: number; // 0 = car-dependent,    10 = fully walkable
  nightlife:   number; // 0 = early nights,     10 = night owl
  outdoors:    number; // 0 = indoor person,    10 = outdoor enthusiast
  diversity:   number; // 0 = homogeneous,      10 = multicultural melting pot
  budget:      number; // 0 = very budget,      10 = luxury spend
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export type QuestionType = "slider" | "choice" | "multi";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  emoji: string;
  question: string;
  subtext?: string;
  // slider questions
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  // choice / multi questions
  options?: { value: string; label: string; emoji: string }[];
  // how this answer maps into VibeProfile dimensions
  mapping: (value: string | number) => Partial<VibeProfile>;
}

// ─── Neighborhoods ────────────────────────────────────────────────────────────
export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;   // geographic centroid latitude
  lon: number;   // geographic centroid longitude
  description: string;
  tagline: string;
  medianPrice: number;       // USD
  rentMedian: number;        // USD/mo
  vibe: VibeProfile;
  tags: string[];            // quick descriptors e.g. "Dog-friendly", "Artsy"
  image: string;             // gradient class or placeholder
}

// ─── Results ─────────────────────────────────────────────────────────────────
export interface NeighborhoodMatch {
  neighborhood: Neighborhood;
  score: number;             // 0–100
  breakdown: Record<keyof VibeProfile, number>; // per-dimension scores
  headline: string;          // e.g. "Great for night owls who love culture"
}

// ─── Activities (Overpass API) ────────────────────────────────────────────────
export interface Activity {
  name: string;
  type: string;  // "restaurant" | "cafe" | "bar" | "park" | "museum" | etc.
  lat: number;
  lon: number;
}
