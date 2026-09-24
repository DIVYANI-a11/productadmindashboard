"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { fetchProduct, fetchCategories, updateProduct } from "@/lib/api/products";
import { applyOverrideToOne, getLocalById, isDeleted, recordEdit } from "@/lib/localOverrides";

import ProductForm from "@/components/ProductForm";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [state, setState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  function load() {
    setState("loading");
    const numericId = Number(id);

    if (isDeleted(numericId)) {
      setState("not-found");
      return;
    }

    if (numericId < 0) {
      const local = getLocalById(numericId);
      if (local) {
        setProduct(local);
        setState("ready");
      } else {
        setState("not-found");
      }
      return;
    }

    fetchProduct(numericId)
      .then((data) => {
        const merged = applyOverrideToOne(data);
        if (!merged) {
          setState("not-found");
          return;
        }
        setProduct(merged);
        setState("ready");
      })
      .catch((err) => {
        if (err?.status === 404) setState("not-found");
        else {
          setState("error");
          setErrorMessage(err?.message || "Couldn't load this product.");
        }
      });
  }

  useEffect(() => {
    load();
    fetchCategories().then(setCategories).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(values) {
    const numericId = Number(id);
    // Same story as adding: the API pretends to update the product but
    // doesn't persist it, so the edit that actually sticks around comes
    // from the local overrides layer.
    if (numericId >= 0) {
      await updateProduct(numericId, values);
    }
    recordEdit(numericId, values);
    router.push(`/products/${id}`);
  }

  if (state === "loading") return <Loader label="Loading product" />;

  if (state === "not-found") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-white py-16 text-center shadow-card">
        <p className="text-lg font-semibold text-ink">Product not found</p>
        <Link href="/products" className="mt-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          Back to products
        </Link>
      </div>
    );
  }

  if (state === "error") return <ErrorState message={errorMessage} onRetry={load} />;

  return (
    <div className="mx-auto max-w-lg">
      <Link href={`/products/${id}`} className="text-sm text-brand-600 hover:underline">
        ← Back to product
      </Link>
      <div className="mt-4 rounded-md border border-line bg-white p-5 shadow-card">
        <h1 className="text-lg font-semibold text-ink">Edit product</h1>
        <div className="mt-5">
          <ProductForm
            categories={categories}
            initialValues={{
              title: product.title || "",
              category: product.category || "",
              price: String(product.price ?? ""),
              stock: String(product.stock ?? ""),
              brand: product.brand || "",
              description: product.description || "",
              thumbnail: product.thumbnail || "",
            }}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
