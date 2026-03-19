import { QuizQuestion, VibeProfile } from "@/types";

/**
 * The 10-question onboarding quiz.
 * Each question's `mapping` function converts the raw answer into VibeProfile
 * dimensions. Multiple questions can contribute to the same dimension —
 * the final profile is the average across all contributing questions.
 */
export const questions: QuizQuestion[] = [
  // 1. Social energy ─────────────────────────────────────────────────────────
  {
    id: "social-energy",
    type: "slider",
    emoji: "🧠",
    question: "How would you describe your social energy?",
    subtext: "On a typical week, where do you naturally fall?",
    min: 0,
    max: 10,
    minLabel: "Total introvert — home is my recharge",
    maxLabel: "Pure extrovert — the more the merrier",
    mapping: (val) => ({ social: val as number }),
  },

  // 2. Ideal weekend ─────────────────────────────────────────────────────────
  {
    id: "ideal-weekend",
    type: "multi",
    emoji: "🗓️",
    question: "Pick your perfect Saturday (choose all that apply)",
    options: [
      { value: "bars",    label: "Bar hopping or club nights",  emoji: "🍹" },
      { value: "hiking",  label: "Hiking or being in nature",   emoji: "🥾" },
      { value: "staying", label: "Staying in — movies & chill", emoji: "🛋️" },
      { value: "sports",  label: "Playing or watching sports",  emoji: "⚽" },
      { value: "culture", label: "Museums, galleries, shows",   emoji: "🎨" },
      { value: "brunch",  label: "Brunch with friends",         emoji: "🥞" },
    ],
    mapping: (val) => {
      const selected = (val as string).split(",");
      const profile: Partial<VibeProfile> = {};
      let social = 5, nightlife = 5, outdoors = 5, noise = 5;

      if (selected.includes("bars"))    { nightlife += 4; social += 3; noise += 3; }
      if (selected.includes("hiking"))  { outdoors += 4; noise -= 2; }
      if (selected.includes("staying")) { social -= 3; noise -= 3; nightlife -= 2; }
      if (selected.includes("sports"))  { social += 2; outdoors += 2; }
      if (selected.includes("culture")) { social += 1; diversity: 7; }
      if (selected.includes("brunch"))  { social += 2; noise += 1; }

      profile.nightlife = Math.max(0, Math.min(10, nightlife));
      profile.social    = Math.max(0, Math.min(10, social));
      profile.outdoors  = Math.max(0, Math.min(10, outdoors));
      profile.noise     = Math.max(0, Math.min(10, noise));
      return profile;
    },
  },

  // 3. Noise tolerance ────────────────────────────────────────────────────────
  {
    id: "noise-tolerance",
    type: "slider",
    emoji: "🔊",
    question: "How do you feel about ambient noise and activity?",
    min: 0,
    max: 10,
    minLabel: "I need peace and quiet",
    maxLabel: "I love a buzzing, lively scene",
    mapping: (val) => ({ noise: val as number, social: (val as number) * 0.5 }),
  },

  // 4. Stage of life ─────────────────────────────────────────────────────────
  {
    id: "life-stage",
    type: "choice",
    emoji: "🌱",
    question: "Where are you in life right now?",
    options: [
      { value: "student",  label: "Student",           emoji: "🎓" },
      { value: "youngpro", label: "Young professional", emoji: "💼" },
      { value: "couple",   label: "Couple / no kids",  emoji: "💑" },
      { value: "family",   label: "Growing family",    emoji: "👨‍👩‍👧" },
      { value: "midlife",  label: "Established adult",  emoji: "🏡" },
      { value: "retired",  label: "Retired / slowing down", emoji: "🌅" },
    ],
    mapping: (val) => {
      const maps: Record<string, Partial<VibeProfile>> = {
        student:  { social: 8, nightlife: 7, budget: 1, urban: 8 },
        youngpro: { social: 7, nightlife: 6, budget: 5, urban: 8 },
        couple:   { social: 5, nightlife: 5, budget: 6, urban: 6 },
        family:   { social: 4, nightlife: 2, budget: 6, noise: 2, outdoors: 6 },
        midlife:  { social: 4, nightlife: 3, budget: 7, noise: 3 },
        retired:  { social: 3, nightlife: 1, budget: 6, noise: 1, outdoors: 6 },
      };
      return maps[val as string] ?? {};
    },
  },

  // 5. Walkability ───────────────────────────────────────────────────────────
  {
    id: "walkability",
    type: "slider",
    emoji: "🚶",
    question: "How important is being able to walk everywhere?",
    min: 0,
    max: 10,
    minLabel: "Fine with driving — car is life",
    maxLabel: "I want to ditch my car completely",
    mapping: (val) => ({ walkability: val as number, urban: (val as number) * 0.6 }),
  },

  // 6. Outdoor life ──────────────────────────────────────────────────────────
  {
    id: "outdoors",
    type: "slider",
    emoji: "🌿",
    question: "How much does being near nature or green space matter to you?",
    min: 0,
    max: 10,
    minLabel: "Not important — I'm an indoors person",
    maxLabel: "Essential — parks, trails, water",
    mapping: (val) => ({ outdoors: val as number }),
  },

  // 7. Nightlife ─────────────────────────────────────────────────────────────
  {
    id: "nightlife",
    type: "slider",
    emoji: "🌙",
    question: "How much does nightlife and dining out matter?",
    min: 0,
    max: 10,
    minLabel: "I'm in bed by 10 — home cooking rules",
    maxLabel: "Late nights, restaurants, bars — yes please",
    mapping: (val) => ({ nightlife: val as number, noise: (val as number) * 0.7 }),
  },

  // 8. Diversity & culture ───────────────────────────────────────────────────
  {
    id: "diversity",
    type: "slider",
    emoji: "🌎",
    question: "How important is cultural diversity and a multicultural vibe?",
    min: 0,
    max: 10,
    minLabel: "Not a priority for me",
    maxLabel: "Essential — I thrive in diverse communities",
    mapping: (val) => ({ diversity: val as number }),
  },

  // 9. Urban vs suburban ─────────────────────────────────────────────────────
  {
    id: "urban-suburban",
    type: "choice",
    emoji: "🏙️",
    question: "What kind of environment speaks to you?",
    options: [
      { value: "dense-urban",  label: "Dense city — towers, transit, buzz",     emoji: "🏙️" },
      { value: "urban",        label: "Urban — walkable city neighborhood",      emoji: "🏘️" },
      { value: "mixed",        label: "Mixed — city feel with breathing room",   emoji: "🌆" },
      { value: "suburban",     label: "Suburban — quiet streets, good schools",  emoji: "🏡" },
      { value: "rural",        label: "Rural — open space, minimal crowds",      emoji: "🌾" },
    ],
    mapping: (val) => {
      const maps: Record<string, Partial<VibeProfile>> = {
        "dense-urban": { urban: 10, noise: 8, walkability: 9 },
        "urban":       { urban: 7,  noise: 6, walkability: 8 },
        "mixed":       { urban: 5,  noise: 5, walkability: 6 },
        "suburban":    { urban: 3,  noise: 2, walkability: 3 },
        "rural":       { urban: 0,  noise: 0, walkability: 1, outdoors: 9 },
      };
      return maps[val as string] ?? {};
    },
  },

  // 10. Budget ───────────────────────────────────────────────────────────────
  {
    id: "budget",
    type: "choice",
    emoji: "💰",
    question: "What's your housing budget mindset?",
    subtext: "This shapes which neighborhoods we'll show you",
    options: [
      { value: "tight",   label: "Tight — every dollar counts",     emoji: "🪙" },
      { value: "moderate",label: "Moderate — good value matters",    emoji: "💵" },
      { value: "flexible",label: "Flexible — comfort over cost",     emoji: "💳" },
      { value: "premium", label: "Premium — I want the best",        emoji: "💎" },
    ],
    mapping: (val) => {
      const maps: Record<string, Partial<VibeProfile>> = {
        tight:    { budget: 1 },
        moderate: { budget: 4 },
        flexible: { budget: 7 },
        premium:  { budget: 10 },
      };
      return maps[val as string] ?? {};
    },
  },
];
