"use client";

import { useState } from "react";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  label?: string;
}

export default function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState<number>(value || min);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setInternalValue(val);
    if (onChange) onChange(val);
  };

  return (
    <div className="flex flex-col w-full space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}: {internalValue}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? internalValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                   accent-blue-500 hover:accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
