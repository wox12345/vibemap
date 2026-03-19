import { VibeProfile } from "@/types";
import { questions } from "@/data/questions";

/**
 * Given a map of questionId → raw answer, build a final VibeProfile by:
 * 1. Running each question's mapping function to get partial dimension contributions.
 * 2. Averaging contributions per dimension across all questions that touched it.
 */
export function buildProfile(answers: Record<string, string | number>): VibeProfile {
  // Accumulate sum and count per dimension
  const sums: Partial<Record<keyof VibeProfile, number>> = {};
  const counts: Partial<Record<keyof VibeProfile, number>> = {};

  questions.forEach((q) => {
    const answer = answers[q.id];
    if (answer === undefined || answer === "") return;

    const partial = q.mapping(answer);

    (Object.keys(partial) as (keyof VibeProfile)[]).forEach((dim) => {
      const val = partial[dim];
      if (val === undefined) return;
      sums[dim]   = (sums[dim]   ?? 0) + val;
      counts[dim] = (counts[dim] ?? 0) + 1;
    });
  });

  // Build final profile with defaults of 5 for any dimension not covered
  const profile: VibeProfile = {
    social:      5,
    noise:       5,
    urban:       5,
    walkability: 5,
    nightlife:   5,
    outdoors:    5,
    diversity:   5,
    budget:      5,
  };

  (Object.keys(sums) as (keyof VibeProfile)[]).forEach((dim) => {
    const avg = (sums[dim] ?? 0) / (counts[dim] ?? 1);
    profile[dim] = Math.round(Math.max(0, Math.min(10, avg)));
  });

  return profile;
}
