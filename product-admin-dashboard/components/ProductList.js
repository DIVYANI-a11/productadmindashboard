"use client";

import Image from "next/image";
import Link from "next/link";

function StockBadge({ stock }) {
  const low = stock <= 5;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        low ? "bg-rust/10 text-rust" : "bg-brand-100 text-brand-700"
      }`}
    >
      {stock} in stock
    </span>
  );
}

export default function ProductList({ products, onDeleteRequest }) {
  return (
    <>
      {/* Desktop: table */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-line text-ink/50">
            <th className="py-2 pl-4 font-medium">Product</th>
            <th className="py-2 font-medium">Category</th>
            <th className="py-2 font-medium">Price</th>
            <th className="py-2 font-medium">Rating</th>
            <th className="py-2 font-medium">Stock</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
              <td className="py-3 pl-4">
                <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-canvas">
                    {p.thumbnail && (
                      <Image src={p.thumbnail} alt={p.title} fill className="object-cover" unoptimized />
                    )}
                  </span>
                  <span className="font-medium text-ink">{p.title}</span>
                </Link>
              </td>
              <td className="py-3 capitalize text-ink/70">{p.category}</td>
              <td className="py-3 text-ink/70">${p.price}</td>
              <td className="py-3 text-ink/70">{p.rating?.toFixed ? p.rating.toFixed(1) : p.rating}</td>
              <td className="py-3">
                <StockBadge stock={p.stock ?? 0} />
              </td>
              <td className="py-3 pr-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/products/${p.id}/edit`}
                    className="rounded-md border border-line px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-canvas"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDeleteRequest(p)}
                    className="rounded-md border border-rust/30 px-2.5 py-1 text-xs font-medium text-rust transition hover:bg-rust/5"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: cards */}
      <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="rounded-md border border-line bg-white p-3 shadow-card">
            <div className="flex gap-3">
              <Link href={`/products/${p.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-canvas">
                {p.thumbnail && (
                  <Image src={p.thumbnail} alt={p.title} fill className="object-cover" unoptimized />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p.id}`} className="block truncate font-medium text-ink">
                  {p.title}
                </Link>
                <p className="capitalize text-sm text-ink/60">{p.category}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink/70">
                  <span>${p.price}</span>
                  <span>· {p.rating?.toFixed ? p.rating.toFixed(1) : p.rating}★</span>
                  <StockBadge stock={p.stock ?? 0} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/products/${p.id}/edit`}
                className="flex-1 rounded-md border border-line px-2.5 py-1.5 text-center text-xs font-medium text-ink transition hover:bg-canvas"
              >
                Edit
              </Link>
              <button
                onClick={() => onDeleteRequest(p)}
                className="flex-1 rounded-md border border-rust/30 px-2.5 py-1.5 text-xs font-medium text-rust transition hover:bg-rust/5"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
