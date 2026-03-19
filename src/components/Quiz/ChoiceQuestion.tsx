"use client";

import clsx from "clsx";

interface Option {
  value: string;
  label: string;
  emoji: string;
}

interface ChoiceQuestionProps {
  options: Option[];
  selected: string;
  multi?: boolean;
  onChange: (val: string) => void;
}

export default function ChoiceQuestion({
  options,
  selected,
  multi = false,
  onChange,
}: ChoiceQuestionProps) {
  const selectedSet = new Set(selected ? selected.split(",") : []);

  const handleClick = (value: string) => {
    if (!multi) {
      onChange(value);
      return;
    }
    const next = new Set(selectedSet);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange([...next].join(","));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selectedSet.has(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            className={clsx(
              "flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-left font-medium transition-all duration-150 active:scale-95",
              isSelected
                ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/40"
            )}
          >
            <span className="text-2xl flex-none">{opt.emoji}</span>
            <span className="text-sm leading-tight">{opt.label}</span>
            {isSelected && (
              <span className="ml-auto flex-none w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
