import api from "@/lib/axios";

/**
 * DummyJSON has three separate "list" endpoints (plain list, search, and
 * by-category) and it can't search and filter by category at the same
 * time. We pick the right endpoint here so the rest of the app just asks
 * for "products matching these params" without worrying about that.
 *
 * Decision: search wins over category. If someone has typed a search
 * term, we search across all products and ignore the category filter
 * (the UI disables the category dropdown while a search is active and
 * explains why). This matches what most admins expect: typing "phone"
 * should search everything, not just whatever category happened to be
 * selected.
 */
export function fetchProducts({ q, category, limit, skip, sortBy, order, signal }) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }

  let url = "/products";
  if (q) {
    url = "/products/search";
    params.q = q;
  } else if (category) {
    url = `/products/category/${encodeURIComponent(category)}`;
  }

  return api.get(url, { params, signal }).then((res) => res.data);
}

export function fetchCategories(signal) {
  return api.get("/products/categories", { signal }).then((res) => res.data);
}

export function fetchProduct(id, signal) {
  return api.get(`/products/${id}`, { signal }).then((res) => res.data);
}

export function addProduct(payload) {
  return api.post("/products/add", payload).then((res) => res.data);
}

export function updateProduct(id, payload) {
  return api.put(`/products/${id}`, payload).then((res) => res.data);
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`).then((res) => res.data);
}
