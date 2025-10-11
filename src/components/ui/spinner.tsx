"use client";

export function Spinner({
  size = 8,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-t-transparent border-blue-500 ${className}`}
      style={{ width: `${size}rem`, height: `${size}rem` }}
      role="status"
      aria-label="Loading"
    ></div>
  );
}
