import { VibeProfile, Neighborhood, NeighborhoodMatch } from "@/types";
import { neighborhoods } from "@/data/neighborhoods";

// ─── Dimension weights ────────────────────────────────────────────────────────
// These weights determine how much each vibe axis contributes to the final score.
// Weights should sum to 1.0.
const WEIGHTS: Record<keyof VibeProfile, number> = {
  social:      0.15,
  noise:       0.15,
  urban:       0.12,
  walkability: 0.14,
  nightlife:   0.12,
  outdoors:    0.12,
  diversity:   0.10,
  budget:      0.10,
};

/**
 * Calculate a per-dimension similarity score (0–1) using an inverted absolute
 * difference. A perfect match returns 1.0; max distance (10 apart) returns 0.0.
 */
function dimensionScore(userVal: number, hoodVal: number): number {
  return 1 - Math.abs(userVal - hoodVal) / 10;
}

/**
 * Build a human-readable headline for a match based on the user's strongest
 * dimensions and the neighborhood's character.
 */
function buildHeadline(user: VibeProfile, hood: Neighborhood): string {
  const traits: string[] = [];

  if (user.social >= 7)       traits.push("social");
  else if (user.social <= 3)  traits.push("private");

  if (user.nightlife >= 7)    traits.push("night-life loving");
  if (user.outdoors >= 7)     traits.push("outdoorsy");
  if (user.walkability >= 7)  traits.push("walkability-obsessed");
  if (user.diversity >= 7)    traits.push("culture-hungry");
  if (user.noise <= 3)        traits.push("quiet-seeking");

  const traitStr = traits.length
    ? traits.slice(0, 2).join(", ")
    : "well-rounded";

  const budget = user.budget >= 7 ? "upscale" : user.budget <= 3 ? "budget-conscious" : "";
  const budgetPart = budget ? ` with a ${budget} lifestyle` : "";

  return `Great for ${traitStr} people${budgetPart} — ${hood.tagline.toLowerCase()}.`;
}

/**
 * Core matching function.
 *
 * @param userProfile  - The user's vibe profile from the quiz
 * @param topN         - How many results to return (default 5)
 * @param cityFilter   - Optional city name to restrict results to. Pass "undecided"
 *                       or omit to search all neighborhoods.
 */
export function matchNeighborhoods(
  userProfile: VibeProfile,
  topN = 5,
  cityFilter?: string
): NeighborhoodMatch[] {
  // Filter to the requested city if one was chosen
  const pool =
    cityFilter && cityFilter !== "undecided"
      ? neighborhoods.filter((n) => n.city === cityFilter)
      : neighborhoods;

  const results: NeighborhoodMatch[] = pool.map((hood) => {
    const breakdown = {} as Record<keyof VibeProfile, number>;
    let weightedScore = 0;

    (Object.keys(WEIGHTS) as (keyof VibeProfile)[]).forEach((dim) => {
      const dimScore = dimensionScore(userProfile[dim], hood.vibe[dim]);
      breakdown[dim] = Math.round(dimScore * 100);
      weightedScore += dimScore * WEIGHTS[dim];
    });

    // Convert to 0–100 integer percentage
    const score = Math.round(weightedScore * 100);

    return {
      neighborhood: hood,
      score,
      breakdown,
      headline: buildHeadline(userProfile, hood),
    };
  });

  // Sort by score descending, take top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/**
 * "People like you also liked" — neighborhoods similar to a given match
 * that didn't appear in the top results.
 *
 * @param cityFilter - If provided, restricts suggestions to the same city.
 */
export function getSimilarNeighborhoods(
  target: Neighborhood,
  exclude: string[],
  topN = 3,
  cityFilter?: string
): Neighborhood[] {
  const pool =
    cityFilter && cityFilter !== "undecided"
      ? neighborhoods.filter((n) => n.city === cityFilter)
      : neighborhoods;

  return pool
    .filter((n) => !exclude.includes(n.id))
    .map((n) => {
      let sim = 0;
      (Object.keys(WEIGHTS) as (keyof VibeProfile)[]).forEach((dim) => {
        sim += dimensionScore(target.vibe[dim], n.vibe[dim]) * WEIGHTS[dim];
      });
      return { n, sim };
    })
    .sort((a, b) => b.sim - a.sim)
    .slice(0, topN)
    .map((x) => x.n);
}
