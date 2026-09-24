"use client";

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "price", label: "Price" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
];

export default function FilterSortBar({
  categories,
  category,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
  searchActive,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-sm text-ink/70">
        <span className="hidden sm:inline">Category</span>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={searchActive}
          title={
            searchActive
              ? "Category filter is off while you're searching, since the API can't do both at once"
              : undefined
          }
          className="rounded-md border border-line bg-white px-2 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All categories</option>
          {categories.map((c) => {
            const slug = typeof c === "string" ? c : c.slug;
            const name = typeof c === "string" ? c : c.name;
            return (
              <option key={slug} value={slug}>
                {name}
              </option>
            );
          })}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-sm text-ink/70">
        <span className="hidden sm:inline">Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, order || "asc")}
          className="rounded-md border border-line bg-white px-2 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {sortBy && (
        <button
          type="button"
          onClick={() => onSortChange(sortBy, order === "asc" ? "desc" : "asc")}
          className="rounded-md border border-line bg-white px-2.5 py-2 text-sm text-ink transition hover:bg-canvas"
          title="Toggle ascending / descending"
        >
          {order === "desc" ? "↓ Descending" : "↑ Ascending"}
        </button>
      )}

      {searchActive && (
        <p className="text-xs text-ink/50">
          Category filter is disabled while searching (see README).
        </p>
      )}
    </div>
  );
}
