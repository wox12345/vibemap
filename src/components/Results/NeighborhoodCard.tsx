"use client";

import { useState } from "react";
import { Heart, MapPin, TrendingUp, Navigation, ExternalLink, Loader2 } from "lucide-react";
import clsx from "clsx";
import { NeighborhoodMatch, Activity } from "@/types";
import MatchScore from "./MatchScore";

interface NeighborhoodCardProps {
  match: NeighborhoodMatch;
  rank: number;
  saved: boolean;
  onSave: () => void;
  activities?: Activity[];
  activitiesLoading?: boolean;
  onFetchActivities?: () => void;
}

// Activity type → emoji
const ACTIVITY_EMOJI: Record<string, string> = {
  restaurant: "🍽️",
  cafe:       "☕",
  bar:        "🍺",
  park:       "🌳",
  museum:     "🏛️",
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function VibeBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-400 transition-all duration-700"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Groups activities by type and returns a map of type → name list.
 * Caps each category at 5 items.
 */
function groupActivities(list: Activity[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const a of list) {
    if (!groups[a.type]) groups[a.type] = [];
    if (groups[a.type].length < 5) groups[a.type].push(a.name);
  }
  return groups;
}

/**
 * Build a Zillow rental search URL for a given neighborhood.
 * Format: zillow.com/homes/for_rent/{neighborhood}-{city},-{state}_rb/
 */
function zillowRentUrl(name: string, city: string, state: string): string {
  const slug = `${name}-${city},-${state}`
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .toLowerCase();
  return `https://www.zillow.com/homes/for_rent/${slug}_rb/`;
}

/**
 * Build an Apartments.com search URL for a neighborhood.
 */
function apartmentsUrl(city: string, state: string, name: string): string {
  const citySlug = `${city}-${state}`.replace(/\s+/g, "-").toLowerCase();
  const hoodSlug = name.replace(/\s+/g, "-").toLowerCase();
  return `https://www.apartments.com/${citySlug}/${hoodSlug}/`;
}

export default function NeighborhoodCard({
  match,
  rank,
  saved,
  onSave,
  activities,
  activitiesLoading = false,
  onFetchActivities,
}: NeighborhoodCardProps) {
  const [expanded, setExpanded]         = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  const { neighborhood: hood, score, headline } = match;
  const activityGroups = activities ? groupActivities(activities) : null;

  const handleActivitiesToggle = () => {
    if (!showActivities && activities === undefined) {
      // First open — trigger the fetch
      onFetchActivities?.();
    }
    setShowActivities((v) => !v);
  };

  return (
    <div className={clsx(
      "bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200",
      rank === 1 && "border-brand-300 ring-1 ring-brand-200"
    )}>
      {/* Color banner */}
      <div className={clsx("h-3 w-full bg-gradient-to-r", hood.image)} />

      <div className="p-6">
        {/* ── Top row ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {rank === 1 && (
              <span className="inline-block text-xs font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full mb-2">
                ⭐ Top match
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{hood.name}</h3>
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {hood.city}, {hood.state}
            </p>
          </div>
          <div className="flex items-start gap-3 flex-none">
            <MatchScore score={score} />
            <button
              onClick={onSave}
              aria-label={saved ? "Unsave" : "Save"}
              className="mt-1 w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:border-rose-300 transition-colors"
            >
              <Heart className={clsx("w-4 h-4 transition-colors", saved ? "fill-rose-500 text-rose-500" : "text-gray-400")} />
            </button>
          </div>
        </div>

        {/* ── Headline ────────────────────────────────────────────────── */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{headline}</p>

        {/* ── Quick stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> Median
            </div>
            <div className="font-bold text-sm text-gray-900">{formatPrice(hood.medianPrice)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
              <Navigation className="w-3 h-3" /> Walk
            </div>
            <div className="font-bold text-sm text-gray-900">{hood.vibe.walkability}/10</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
              🏠 Rent/mo
            </div>
            <div className="font-bold text-sm text-gray-900">{formatPrice(hood.rentMedian)}</div>
          </div>
        </div>

        {/* ── Tags ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {hood.tags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* ── Apartment links ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
          <a
            href={zillowRentUrl(hood.name, hood.city, hood.state)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Find apartments on Zillow
          </a>
          <a
            href={apartmentsUrl(hood.city, hood.state, hood.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Apartments.com
          </a>
        </div>

        {/* ── Action toggles ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-brand-600 font-semibold hover:underline"
          >
            {expanded ? "Hide vibe breakdown ↑" : "See vibe breakdown ↓"}
          </button>
          <button
            onClick={handleActivitiesToggle}
            className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
          >
            {activitiesLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {showActivities ? "Hide nearby places ↑" : "Show nearby places ↓"}
          </button>
        </div>

        {/* ── Vibe breakdown ────────────────────────────────────────────── */}
        {expanded && (
          <div className="mt-4 space-y-2.5 animate-fade-in">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Neighborhood profile</p>
            <VibeBar label="🎉 Social scene"   value={hood.vibe.social} />
            <VibeBar label="🔊 Noise level"     value={hood.vibe.noise} />
            <VibeBar label="🏙️ Urban density"  value={hood.vibe.urban} />
            <VibeBar label="🚶 Walkability"     value={hood.vibe.walkability} />
            <VibeBar label="🌙 Nightlife"       value={hood.vibe.nightlife} />
            <VibeBar label="🌿 Outdoor access" value={hood.vibe.outdoors} />
            <VibeBar label="🌎 Diversity"       value={hood.vibe.diversity} />
          </div>
        )}

        {/* ── Nearby activities ─────────────────────────────────────────── */}
        {showActivities && (
          <div className="mt-4 animate-fade-in">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Nearby places <span className="normal-case font-normal text-gray-300">(via OpenStreetMap)</span>
            </p>

            {activitiesLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching real nearby places…
              </div>
            )}

            {!activitiesLoading && activityGroups && Object.keys(activityGroups).length === 0 && (
              <p className="text-sm text-gray-400">No places found nearby.</p>
            )}

            {!activitiesLoading && activityGroups && Object.keys(activityGroups).length > 0 && (
              <div className="space-y-3">
                {Object.entries(activityGroups).map(([type, names]) => (
                  <div key={type}>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {ACTIVITY_EMOJI[type] ?? "📍"} {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </p>
                    <ul className="space-y-0.5">
                      {names.map((name) => (
                        <li key={name} className="text-xs text-gray-500 pl-5">
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <a
                  href={`https://www.google.com/maps/search/things+to+do+near+${encodeURIComponent(hood.name + " " + hood.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Explore more on Google Maps
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
