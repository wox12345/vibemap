"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

interface MatchScoreProps {
  score: number; // 0–100
  size?: "sm" | "lg";
}

function scoreColor(score: number) {
  if (score >= 85) return "#22c55e"; // green
  if (score >= 70) return "#4450ec"; // brand blue
  if (score >= 55) return "#f59e0b"; // amber
  return "#ef4444";                   // red
}

function scoreLabel(score: number) {
  if (score >= 90) return "Perfect match";
  if (score >= 80) return "Great match";
  if (score >= 65) return "Good match";
  return "Decent match";
}

export default function MatchScore({ score, size = "lg" }: MatchScoreProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r = size === "lg" ? 40 : 28;
  const cx = size === "lg" ? 52 : 36;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    if (!circleRef.current) return;
    const offset = circumference - (score / 100) * circumference;
    circleRef.current.style.strokeDashoffset = String(offset);
  }, [score, circumference]);

  const svgSize = size === "lg" ? 104 : 72;
  const fontSize = size === "lg" ? "text-2xl" : "text-base";
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={size === "lg" ? 8 : 6}
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={size === "lg" ? 8 : 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx("font-extrabold tabular-nums", fontSize)} style={{ color }}>
            {score}%
          </span>
        </div>
      </div>
      {size === "lg" && (
        <span className="text-xs font-semibold" style={{ color }}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  );
}
