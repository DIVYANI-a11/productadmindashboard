"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { fetchProducts, fetchCategories, deleteProduct as apiDeleteProduct } from "@/lib/api/products";
import { applyOverrides, getLocalAdded, recordDelete } from "@/lib/localOverrides";
import { parsePage, parsePageSize, parseOrder } from "@/lib/queryParams";
import { useDebounce } from "@/hooks/useDebounce";

import SearchBar from "@/components/SearchBar";
import FilterSortBar from "@/components/FilterSortBar";
import ProductList from "@/components/ProductList";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the single source of truth for page, pageSize, q,
  // category, sortBy and order - so refreshing or sharing the link
  // reproduces the same view.
  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = parseOrder(searchParams.get("order"));

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error | empty
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const abortRef = useRef(null);
  const reloadToken = useRef(0);

  function updateQuery(patch) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value === "" || value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // When the debounced search value settles and differs from the URL,
  // push it to the URL and reset back to page 1.
  useEffect(() => {
    if (debouncedSearch === q) return;
    updateQuery({ q: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load categories once.
  useEffect(() => {
    let ignore = false;
    fetchCategories()
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch(() => {
        // Non-fatal: the category dropdown just stays empty.
      });
    return () => {
      ignore = true;
    };
  }, []);

  const loadProducts = useCallback(() => {
    // Cancel whatever request is still in flight before starting a new
    // one. Combined with the token check below, this guarantees that if
    // someone types quickly, an older, slower response can never
    // overwrite a newer one.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const myToken = ++reloadToken.current;

    setLoadState("loading");
    setErrorMessage("");

    fetchProducts({
      q: q || undefined,
      category: q ? undefined : category || undefined,
      limit: pageSize,
      skip: (page - 1) * pageSize,
      sortBy: sortBy || undefined,
      order,
      signal: controller.signal,
    })
      .then((data) => {
        if (myToken !== reloadToken.current) return; // a newer request already landed

        let list = applyOverrides(data.products || []);
        let effectiveTotal = data.total || 0;

        // Locally-added items only make sense to show on an unfiltered
        // first page - otherwise "page 2 of a search" would suddenly
        // grow items that don't match the search at all.
        if (page === 1 && !q && !category && !sortBy) {
          const added = getLocalAdded();
          list = [...added, ...list];
          effectiveTotal += added.length;
        }

        setProducts(list);
        setTotal(effectiveTotal);
        setLoadState(list.length === 0 ? "empty" : "ready");

        // If the requested page is past the end (e.g. someone typed
        // ?page=999), snap back to the last real page instead of
        // showing a broken, empty page forever.
        const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
        if (page > totalPages) {
          updateQuery({ page: totalPages });
        }
      })
      .catch((err) => {
        if (err?.cancelled) return;
        if (myToken !== reloadToken.current) return;
        setLoadState("error");
        setErrorMessage(err?.message || "Couldn't load products.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, page, pageSize, sortBy, order]);

  useEffect(() => {
    loadProducts();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [loadProducts]);

  const searchActive = Boolean(q);

  function handleDeleteRequest(product) {
    setPendingDelete(product);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      // Locally-added items (negative id) only ever existed on this
      // device, so there's nothing to call the API for.
      if (pendingDelete.id >= 0) {
        await apiDeleteProduct(pendingDelete.id);
      }
      recordDelete(pendingDelete.id);
      setPendingDelete(null);
      loadProducts();
    } catch (err) {
      setErrorMessage(err?.message || "Couldn't delete this product.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-ink">Products</h1>
        <Link
          href="/products/new"
          className="rounded-md bg-brand-500 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Add product
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        <FilterSortBar
          categories={categories}
          category={category}
          onCategoryChange={(value) => updateQuery({ category: value, page: 1 })}
          sortBy={sortBy}
          order={order}
          onSortChange={(nextSortBy, nextOrder) =>
            updateQuery({ sortBy: nextSortBy, order: nextSortBy ? nextOrder : undefined, page: 1 })
          }
          searchActive={searchActive}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-line bg-white shadow-card">
        {loadState === "loading" && <Loader label="Loading products" />}

        {loadState === "error" && <ErrorState message={errorMessage} onRetry={loadProducts} />}

        {loadState === "empty" && (
          <EmptyState
            title="No products found"
            description={
              searchActive
                ? `Nothing matches "${q}". Try a different search term.`
                : "Try a different category or check back later."
            }
          />
        )}

        {loadState === "ready" && (
          <>
            <ProductList products={products} onDeleteRequest={handleDeleteRequest} />
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(nextPage) => updateQuery({ page: nextPage })}
              onPageSizeChange={(nextSize) => updateQuery({ pageSize: nextSize, page: 1 })}
            />
          </>
        )}
      </div>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        description={pendingDelete ? `"${pendingDelete.title}" will be removed from the list.` : ""}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
