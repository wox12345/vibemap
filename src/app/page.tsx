"use client";

import Link from "next/link";
import { MapPin, Zap, Heart, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Personality-first matching",
    desc: "We analyze your lifestyle, not just your budget. Answer 10 quick questions and we do the math.",
  },
  {
    icon: MapPin,
    title: "Real neighborhood data",
    desc: "Every neighborhood is scored across walkability, nightlife, nature, diversity, and more.",
  },
  {
    icon: Heart,
    title: "Your vibe, your match",
    desc: "Get a ranked shortlist of neighborhoods with a match score and plain-English explanation.",
  },
];

const tags = [
  "🏙️ Urban density", "🌿 Green space", "🎵 Music scene", "🌙 Nightlife",
  "🚶 Walkability", "👨‍👩‍👧 Family-friendly", "🎨 Arts & culture", "🏄 Outdoor life",
  "☕ Coffee culture", "🌎 Diversity",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">VibeMap</span>
        </div>
        <Link
          href="/quiz"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Take the quiz <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Gradient blob */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-brand-100 via-purple-50 to-pink-50 opacity-60 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-6 border border-brand-100">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Vibe-based neighborhood matching
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Find where you{" "}
          <span className="text-gradient">actually</span>
          <br />
          belong.
        </h1>

        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Stop scrolling Zillow. Tell us about your lifestyle and we'll match you to neighborhoods that actually fit who you are.
        </p>

        <Link
          href="/quiz"
          className="inline-flex items-center gap-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-brand-200 transition-all duration-200"
        >
          Find my neighborhood
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-gray-400 text-sm mt-4">Takes about 2 minutes · No signup required</p>

        {/* Scrolling tag strip */}
        <div className="mt-14 -mx-6 overflow-hidden">
          <div className="flex gap-3 animate-[scroll_25s_linear_infinite] w-max">
            {[...tags, ...tags].map((tag, i) => (
              <span
                key={i}
                className="flex-none px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 shadow-sm whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="mx-6 md:mx-12 mb-20 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-center text-white overflow-hidden relative">
        <div aria-hidden className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-5" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white opacity-5" />
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to find your place?</h2>
        <p className="text-brand-200 mb-8 max-w-sm mx-auto">
          10 questions. 5 matches. Your next chapter starts here.
        </p>
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
        >
          Start the quiz <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        VibeMap · Built with ❤️ for people who belong somewhere great
      </footer>

      <style jsx global>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}
