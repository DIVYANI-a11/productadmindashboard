/**
 * DummyJSON's add/edit/delete endpoints respond as if the change worked,
 * but nothing is actually saved on their server - fetch the list again
 * and your "deleted" product is still there. To make the app behave like
 * a real admin tool during a session, we keep a small overrides layer in
 * localStorage:
 *
 *  - added: products created in this session (they have no real id from
 *    the server we can rely on across reloads of a fresh list, so we
 *    keep the full object).
 *  - edited: a map of id -> partial fields to merge over whatever the API
 *    returns for that id.
 *  - deletedIds: ids that should be hidden from lists.
 *
 * applyOverrides() is called on every list/detail response so the UI is
 * consistent no matter which page you're on, for as long as the browser
 * tab remembers it. This is explained in NOTES.md.
 */

const KEY = "product-overrides";

function read() {
  if (typeof window === "undefined") return { added: [], edited: {}, deletedIds: [] };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { added: [], edited: {}, deletedIds: [] };
  } catch {
    return { added: [], edited: {}, deletedIds: [] };
  }
}

function write(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordAdd(product) {
  const data = read();
  // DummyJSON always echoes back id: 195 or similar for every add, so we
  // give locally-added items their own negative id to keep them unique.
  const localId = -(Date.now());
  const withId = { ...product, id: localId };
  data.added = [withId, ...data.added];
  write(data);
  return withId;
}

export function recordEdit(id, fields) {
  const data = read();
  data.edited[id] = { ...(data.edited[id] || {}), ...fields };
  write(data);
}

export function recordDelete(id) {
  const data = read();
  if (!data.deletedIds.includes(id)) data.deletedIds.push(id);
  write(data);
}

export function getLocalAdded() {
  return read().added;
}

export function getLocalEdit(id) {
  return read().edited[String(id)] || read().edited[id] || null;
}

export function isDeleted(id) {
  return read().deletedIds.includes(id);
}

// Apply edits + deletions to a list of products coming back from the API.
// Locally-added products are prepended separately by the caller (they
// only belong on an unfiltered, first-page, no-search view - see
// ProductList).
export function applyOverrides(products) {
  const data = read();
  return products
    .filter((p) => !data.deletedIds.includes(p.id))
    .map((p) => (data.edited[p.id] ? { ...p, ...data.edited[p.id] } : p));
}

export function getLocalById(id) {
  const numericId = Number(id);
  const data = read();
  return data.added.find((p) => p.id === numericId) || null;
}

export function applyOverrideToOne(product) {
  if (!product) return product;
  const data = read();
  if (data.deletedIds.includes(product.id)) return null;
  return data.edited[product.id] ? { ...product, ...data.edited[product.id] } : product;
}
