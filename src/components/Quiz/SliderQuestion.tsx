"use client";

interface SliderQuestionProps {
  value: number;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onChange: (val: number) => void;
}

// Visual emoji markers along the slider track
const markerEmojis = ["😴", "🤔", "😊", "😄", "🤩"];

export default function SliderQuestion({
  value,
  min,
  max,
  minLabel,
  maxLabel,
  onChange,
}: SliderQuestionProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-6">
      {/* Current value display */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl" role="img">
            {markerEmojis[Math.round((pct / 100) * (markerEmojis.length - 1))]}
          </span>
          <span className="text-sm font-semibold text-brand-600 tabular-nums">
            {value} / {max}
          </span>
        </div>
      </div>

      {/* Track */}
      <div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #4450ec ${pct}%, #e5e7eb ${pct}%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400 max-w-[40%] leading-tight">{minLabel}</span>
          <span className="text-xs text-gray-400 max-w-[40%] text-right leading-tight">{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
