"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-64">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products"
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
        >
          ×
        </button>
      )}
    </div>
  );
}
