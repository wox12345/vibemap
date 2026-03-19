"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, RotateCcw, Bookmark } from "lucide-react";
import { VibeProfile, NeighborhoodMatch, Neighborhood, Activity } from "@/types";
import { matchNeighborhoods, getSimilarNeighborhoods } from "@/lib/matching";
import NeighborhoodCard from "@/components/Results/NeighborhoodCard";

const VIBE_LABELS: { key: keyof VibeProfile; emoji: string; label: string }[] = [
  { key: "social",      emoji: "🎉", label: "Social" },
  { key: "nightlife",   emoji: "🌙", label: "Nightlife" },
  { key: "outdoors",    emoji: "🌿", label: "Outdoors" },
  { key: "walkability", emoji: "🚶", label: "Walkability" },
  { key: "urban",       emoji: "🏙️", label: "Urban" },
  { key: "diversity",   emoji: "🌎", label: "Diversity" },
];

export default function ResultsPage() {
  const [matches, setMatches]   = useState<NeighborhoodMatch[]>([]);
  const [similar, setSimilar]   = useState<Neighborhood[]>([]);
  const [profile, setProfile]   = useState<VibeProfile | null>(null);
  const [cityChoice, setCityChoice] = useState<string>("undecided");
  const [saved, setSaved]       = useState<Set<string>>(new Set());
  const [loaded, setLoaded]     = useState(false);

  // Activities state: keyed by neighborhood id
  const [activities, setActivities]         = useState<Record<string, Activity[]>>({});
  const [activitiesLoading, setActivitiesLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedProfile = sessionStorage.getItem("vibeProfile");
    const storedCity    = sessionStorage.getItem("selectedCity") ?? "undecided";
    if (!storedProfile) return;

    const p: VibeProfile = JSON.parse(storedProfile);
    setProfile(p);
    setCityChoice(storedCity);

    const topMatches = matchNeighborhoods(p, 5, storedCity);
    setMatches(topMatches);

    if (topMatches.length > 0) {
      const excludeIds = topMatches.map((m) => m.neighborhood.id);
      setSimilar(getSimilarNeighborhoods(topMatches[0].neighborhood, excludeIds, 3, storedCity));
    }

    setLoaded(true);
  }, []);

  // Fetch real nearby activities from OpenStreetMap via our API route
  const fetchActivities = useCallback(async (hood: Neighborhood) => {
    if (activities[hood.id] !== undefined) return; // already fetched

    setActivitiesLoading((prev) => new Set(prev).add(hood.id));
    try {
      const res = await fetch(
        `/api/activities?lat=${hood.lat}&lon=${hood.lon}&radius=800`
      );
      const data = await res.json();
      setActivities((prev) => ({ ...prev, [hood.id]: data.activities ?? [] }));
    } catch {
      setActivities((prev) => ({ ...prev, [hood.id]: [] }));
    } finally {
      setActivitiesLoading((prev) => {
        const next = new Set(prev);
        next.delete(hood.id);
        return next;
      });
    }
  }, [activities]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!loaded && typeof window !== "undefined" && !sessionStorage.getItem("vibeProfile")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-6xl">🗺️</div>
        <h1 className="text-2xl font-bold">No quiz results yet</h1>
        <p className="text-gray-500">Take the quiz first to see your neighborhood matches.</p>
        <Link href="/quiz" className="mt-2 bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors">
          Take the quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">VibeMap</span>
          </Link>
          <Link href="/quiz" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Retake quiz
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="mb-8 animate-fade-up">
          <p className="text-sm font-semibold text-brand-600 mb-1">Your results are in ✨</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
            Your top neighborhood matches
          </h1>
          <p className="text-gray-500 text-sm">
            {cityChoice && cityChoice !== "undecided"
              ? `Showing the best neighborhoods in ${cityChoice} for your vibe.`
              : "Showing the best matches across all cities."}
          </p>
        </div>

        {/* ── User vibe profile summary ─────────────────────────────────── */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Your vibe profile</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {VIBE_LABELS.map(({ key, emoji, label }) => {
                const val = profile[key];
                return (
                  <div key={key} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{emoji}</div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-400 to-accent-400 rounded-full" style={{ width: `${val * 10}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-bold text-gray-700">{val}/10</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Match cards ────────────────────────────────────────────────── */}
        {matches.length === 0 && loaded ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="text-4xl mb-3">🤷</div>
            <p className="font-semibold text-gray-700">No neighborhoods found for {cityChoice}.</p>
            <p className="text-sm text-gray-400 mt-1">Try retaking the quiz and selecting a different city.</p>
            <Link href="/quiz" className="inline-block mt-4 bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-brand-700 transition-colors">
              Retake quiz
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {matches.map((match, i) => (
              <div key={match.neighborhood.id} className="animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <NeighborhoodCard
                  match={match}
                  rank={i + 1}
                  saved={saved.has(match.neighborhood.id)}
                  onSave={() => toggleSave(match.neighborhood.id)}
                  activities={activities[match.neighborhood.id]}
                  activitiesLoading={activitiesLoading.has(match.neighborhood.id)}
                  onFetchActivities={() => fetchActivities(match.neighborhood)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── "People like you" ─────────────────────────────────────────── */}
        {similar.length > 0 && (
          <div className="mt-12 animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">👥</span>
              <h2 className="font-bold text-gray-800">People like you also considered…</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {similar.map((hood) => (
                <div key={hood.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-2 w-full bg-gradient-to-r ${hood.image}`} />
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{hood.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{hood.city}, {hood.state}</p>
                    <p className="text-xs text-gray-500 italic leading-relaxed">{hood.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Saved neighborhoods callout ───────────────────────────────── */}
        {saved.size > 0 && (
          <div className="mt-10 bg-brand-50 border border-brand-200 rounded-2xl p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-4 h-4 text-brand-600" />
              <h3 className="font-semibold text-brand-800">
                {saved.size} saved neighborhood{saved.size > 1 ? "s" : ""}
              </h3>
            </div>
            <p className="text-sm text-brand-600">
              Dive deeper on Zillow, Redfin, or Google Maps for each saved neighborhood.
            </p>
          </div>
        )}

        {/* ── Retake CTA ────────────────────────────────────────────────── */}
        <div className="mt-12 text-center border-t border-gray-200 pt-10">
          <p className="text-gray-500 mb-4 text-sm">Want different results? Change your answers.</p>
          <Link href="/quiz" className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors">
            <RotateCcw className="w-4 h-4" /> Retake the quiz
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        VibeMap · Neighborhood data from OpenStreetMap contributors
      </footer>
    </div>
  );
}
