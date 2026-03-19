"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin, Search } from "lucide-react";
import { questions } from "@/data/questions";
import { neighborhoods } from "@/data/neighborhoods";
import { buildProfile } from "@/lib/buildProfile";
import ProgressBar from "@/components/Quiz/ProgressBar";
import SliderQuestion from "@/components/Quiz/SliderQuestion";
import ChoiceQuestion from "@/components/Quiz/ChoiceQuestion";
import Link from "next/link";
import clsx from "clsx";

// Unique, sorted list of cities from our neighborhood data
const CITIES = [...new Set(neighborhoods.map((n) => n.city))].sort();

export default function QuizPage() {
  const router = useRouter();

  // Whether we're on the city-selection step (always shown first)
  const [onCityStep, setOnCityStep] = useState(true);
  const [cityInput, setCityInput]   = useState("");
  const [cityChoice, setCityChoice] = useState(""); // "" = not yet chosen
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quiz question state
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);

  const q = questions[step];
  const totalSteps = questions.length;
  // +1 for the city step
  const progressCurrent = onCityStep ? 1 : step + 2;
  const progressTotal   = totalSteps + 1;

  const currentAnswer = answers[q?.id] ?? (q?.type === "slider" ? 5 : "");
  const canProceed = q?.type === "slider" ? true : (currentAnswer as string).length > 0;

  // Filtered city suggestions based on input
  const citySuggestions = cityInput.length > 0
    ? CITIES.filter((c) => c.toLowerCase().startsWith(cityInput.toLowerCase()))
    : CITIES;

  // Navigate between quiz steps with slide animation
  const navigate = (nextStep: number, dir: "forward" | "back") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  };

  const handleCityConfirm = (city: string) => {
    setCityChoice(city);
    setCityInput(city === "undecided" ? "" : city);
    setShowDropdown(false);
    setOnCityStep(false);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      navigate(step + 1, "forward");
    } else {
      // Quiz complete — build profile and save to sessionStorage
      const finalAnswers = { ...answers };
      questions.forEach((q) => {
        if (q.type === "slider" && finalAnswers[q.id] === undefined) {
          finalAnswers[q.id] = 5;
        }
      });
      const profile = buildProfile(finalAnswers);
      sessionStorage.setItem("vibeProfile",   JSON.stringify(profile));
      sessionStorage.setItem("selectedCity",  cityChoice);
      router.push("/results");
    }
  };

  const handleBack = () => {
    if (step === 0) {
      // Go back to city step
      setOnCityStep(true);
    } else {
      navigate(step - 1, "back");
    }
  };

  const handleAnswer = (val: string | number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">VibeMap</span>
        </Link>
        <button
          onClick={onCityStep ? undefined : handleBack}
          disabled={onCityStep}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </header>

      {/* ── Progress ───────────────────────────────────────────────────── */}
      <div className="bg-white px-6 py-3 border-b border-gray-100">
        <div className="max-w-lg mx-auto">
          <ProgressBar current={progressCurrent} total={progressTotal} />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">

        {/* ── CITY STEP ────────────────────────────────────────────────── */}
        {onCityStep && (
          <div className="w-full max-w-lg animate-fade-up">
            <div className="mb-8">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                Where are you looking to live?
              </h2>
              <p className="text-gray-500 text-sm">
                We'll filter results to neighborhoods in that city — or go wide if you're still exploring.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-6 space-y-4">
              {/* City text input with dropdown */}
              <div className="relative" ref={inputRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={cityInput}
                    placeholder="Type a city (e.g. Austin, Brooklyn…)"
                    onChange={(e) => {
                      setCityInput(e.target.value);
                      setCityChoice(""); // reset choice when user types
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-brand-400 focus:outline-none text-sm font-medium transition-colors"
                  />
                </div>

                {showDropdown && citySuggestions.length > 0 && (
                  <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                    {citySuggestions.map((city) => (
                      <li key={city}>
                        <button
                          onMouseDown={() => handleCityConfirm(city)}
                          className={clsx(
                            "w-full text-left px-4 py-3 text-sm font-medium transition-colors",
                            cityChoice === city
                              ? "bg-brand-50 text-brand-700"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          📍 {city}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Undecided button */}
              <button
                onClick={() => handleCityConfirm("undecided")}
                className={clsx(
                  "w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-left font-medium transition-all duration-150 active:scale-95",
                  cityChoice === "undecided"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/40"
                )}
              >
                <span className="text-2xl">🌎</span>
                <div>
                  <div className="text-sm font-semibold">I'm undecided</div>
                  <div className="text-xs text-gray-400 font-normal">Show me the best matches everywhere</div>
                </div>
                {cityChoice === "undecided" && (
                  <span className="ml-auto flex-none w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setOnCityStep(false)}
              disabled={!cityChoice}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-md shadow-brand-200 disabled:shadow-none"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── QUIZ QUESTIONS ───────────────────────────────────────────── */}
        {!onCityStep && q && (
          <div
            key={q.id}
            className="w-full max-w-lg"
            style={{
              animation: animating
                ? direction === "forward"
                  ? "slideOutLeft 0.2s ease-in forwards"
                  : "slideOutRight 0.2s ease-in forwards"
                : direction === "forward"
                ? "slideInRight 0.3s ease-out both"
                : "slideInLeft 0.3s ease-out both",
            }}
          >
            <div className="mb-8">
              <div className="text-5xl mb-4">{q.emoji}</div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                {q.question}
              </h2>
              {q.subtext && (
                <p className="text-gray-500 text-sm">{q.subtext}</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-6">
              {q.type === "slider" && (
                <SliderQuestion
                  value={currentAnswer as number}
                  min={q.min!}
                  max={q.max!}
                  minLabel={q.minLabel!}
                  maxLabel={q.maxLabel!}
                  onChange={handleAnswer}
                />
              )}
              {(q.type === "choice" || q.type === "multi") && (
                <ChoiceQuestion
                  options={q.options!}
                  selected={currentAnswer as string}
                  multi={q.type === "multi"}
                  onChange={handleAnswer}
                />
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all duration-150 active:scale-95 shadow-md shadow-brand-200 disabled:shadow-none"
            >
              {step === totalSteps - 1 ? "See my matches" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </button>

            {q.type === "multi" && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Select all that apply
              </p>
            )}
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-40px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(40px); }
        }
      `}</style>
    </div>
  );
}
