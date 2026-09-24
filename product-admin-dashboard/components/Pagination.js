"use client";

const PAGE_SIZES = [10, 20, 50];

function getPageNumbers(current, totalPages) {
  // Show up to 5 page numbers centered on the current page.
  const span = 2;
  let start = Math.max(1, current - span);
  let end = Math.min(totalPages, current + span);

  if (end - start < 4) {
    if (start === 1) end = Math.min(totalPages, start + 4);
    else if (end === totalPages) start = Math.max(1, end - 4);
  }

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-sm text-ink/60">
        <span>
          Showing {from}–{to} of {total}
        </span>
        <label className="ml-2 flex items-center gap-1.5">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-line bg-white px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-line px-2.5 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas disabled:opacity-40"
        >
          Previous
        </button>

        {pages[0] > 1 && <span className="px-1 text-ink/40">…</span>}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-[2rem] rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
              p === page
                ? "bg-brand-500 text-white"
                : "border border-line text-ink hover:bg-canvas"
            }`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && <span className="px-1 text-ink/40">…</span>}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-line px-2.5 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
