const VALID_PAGE_SIZES = [10, 20, 50];

// Turns whatever is in the URL into a safe page number. Garbage like
// "abc" or "-3" quietly becomes 1 instead of breaking the page; we clamp
// against the real total once we know it, in the page component.
export function parsePage(raw) {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parsePageSize(raw) {
  const n = parseInt(raw, 10);
  return VALID_PAGE_SIZES.includes(n) ? n : 20;
}

export function parseOrder(raw) {
  return raw === "desc" ? "desc" : "asc";
}
