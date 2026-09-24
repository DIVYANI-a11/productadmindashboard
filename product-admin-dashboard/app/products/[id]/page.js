"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { fetchProduct } from "@/lib/api/products";
import { applyOverrideToOne, getLocalById, isDeleted } from "@/lib/localOverrides";

import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState("loading"); // loading | ready | error | not-found
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  function load() {
    setState("loading");
    const numericId = Number(id);

    if (isDeleted(numericId)) {
      setState("not-found");
      return;
    }

    // Products added in this session only exist locally, never on the
    // real API, so we read them straight from the overrides layer.
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
        setActiveImage(0);
        setState("ready");
      })
      .catch((err) => {
        if (err?.status === 404) {
          setState("not-found");
        } else {
          setState("error");
          setErrorMessage(err?.message || "Couldn't load this product.");
        }
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (state === "loading") return <Loader label="Loading product" />;

  if (state === "not-found") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-white py-16 text-center shadow-card">
        <p className="text-lg font-semibold text-ink">Product not found</p>
        <p className="text-sm text-ink/60">There's no product with id "{id}".</p>
        <Link href="/products" className="mt-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          Back to products
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return <ErrorState message={errorMessage} onRetry={load} />;
  }

  const images = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);

  return (
    <div>
      <Link href="/products" className="text-sm text-brand-600 hover:underline">
        ← Back to products
      </Link>

      <div className="mt-4 grid gap-6 rounded-md border border-line bg-white p-5 shadow-card md:grid-cols-2">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-canvas">
            {images[activeImage] && (
              <Image src={images[activeImage]} alt={product.title} fill className="object-contain" unoptimized />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-14 w-14 overflow-hidden rounded-md border ${
                    i === activeImage ? "border-brand-500" : "border-line"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm capitalize text-ink/50">{product.category}</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{product.title}</h1>
          <p className="mt-2 text-2xl font-semibold text-ink">${product.price}</p>
          <p className="mt-1 text-sm text-ink/60">
            {product.rating?.toFixed ? product.rating.toFixed(1) : product.rating}★ · {product.stock} in stock
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/80">{product.description}</p>

          <div className="mt-5 flex gap-2">
            <Link
              href={`/products/${id}/edit`}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
            >
              Edit product
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-line bg-white p-5 shadow-card">
        <h2 className="text-base font-semibold text-ink">Reviews</h2>
        {product.reviews?.length ? (
          <ul className="mt-3 space-y-4">
            {product.reviews.map((review, i) => (
              <li key={i} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">{review.reviewerName}</span>
                  <span className="text-sm text-ink/50">{review.rating}★</span>
                </div>
                <p className="mt-1 text-sm text-ink/70">{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/50">No reviews for this product yet.</p>
        )}
      </div>
    </div>
  );
}
