/**
 * GET /api/activities?lat=XX&lon=YY&radius=800
 *
 * Fetches real nearby places from OpenStreetMap's Overpass API.
 * No API key required — completely free and open.
 * Returns up to ~30 places grouped across restaurants, cafes, bars, parks, museums.
 */

import { Activity } from "@/types";
import { NextRequest } from "next/server";

// Category definitions — each maps OSM tag key/values to a display type
const CATEGORIES = [
  { key: "amenity", values: ["restaurant"], type: "restaurant" },
  { key: "amenity", values: ["cafe"],       type: "cafe" },
  { key: "amenity", values: ["bar", "pub"], type: "bar" },
  { key: "leisure", values: ["park"],       type: "park" },
  { key: "tourism", values: ["museum"],     type: "museum" },
];

function buildOverpassQuery(lat: number, lon: number, radius: number): string {
  // Build a union of node queries, one per category
  const statements = CATEGORIES.flatMap(({ key, values }) =>
    values.map(
      (v) => `  node["${key}"="${v}"](around:${radius},${lat},${lon});`
    )
  ).join("\n");

  return `[out:json][timeout:15];\n(\n${statements}\n);\nout body 40;`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat    = parseFloat(searchParams.get("lat")    ?? "");
  const lon    = parseFloat(searchParams.get("lon")    ?? "");
  const radius = parseInt(searchParams.get("radius")  ?? "800", 10);

  if (isNaN(lat) || isNaN(lon)) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const query = buildOverpassQuery(lat, lon, radius);

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass asks for a descriptive User-Agent
        "User-Agent": "VibeMap/1.0 (neighborhood matching app)",
      },
      body: `data=${encodeURIComponent(query)}`,
      // Don't cache stale results for too long
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Overpass returned ${res.status}`);
    }

    const json = await res.json();

    // Map OSM elements to clean Activity objects
    const activities: Activity[] = (json.elements ?? [])
      .filter((el: { tags?: Record<string, string> }) => el.tags?.name)
      .map((el: { tags: Record<string, string>; lat: number; lon: number }) => {
        // Derive type from the first matching category tag
        let type = "place";
        for (const { key, values, type: t } of CATEGORIES) {
          if (el.tags[key] && values.includes(el.tags[key])) {
            type = t;
            break;
          }
        }
        return {
          name: el.tags.name,
          type,
          lat: el.lat,
          lon: el.lon,
        } satisfies Activity;
      });

    return Response.json({ activities });
  } catch (err) {
    // Fail gracefully — the UI should still render without activities
    console.error("[/api/activities] Overpass fetch failed:", err);
    return Response.json({ activities: [] });
  }
}
