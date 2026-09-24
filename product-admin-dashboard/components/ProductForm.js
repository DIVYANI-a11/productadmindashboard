"use client";

import { useRef, useState } from "react";

const initialState = {
  title: "",
  category: "",
  price: "",
  stock: "",
  brand: "",
  description: "",
  thumbnail: "",
};

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Title is required.";
  if (!values.category.trim()) errors.category = "Category is required.";

  const price = Number(values.price);
  if (values.price === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "Enter a price greater than 0.";
  }

  const stock = Number(values.stock);
  if (values.stock === "" || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.stock = "Enter a whole number of 0 or more.";
  }

  if (values.thumbnail && !/^https?:\/\//i.test(values.thumbnail)) {
    errors.thumbnail = "Image URL should start with http:// or https://";
  }

  return errors;
}

export default function ProductForm({ categories = [], initialValues, submitLabel, onSubmit }) {
  const [values, setValues] = useState({ ...initialState, ...initialValues });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  // Guards against a burst of clicks firing multiple requests while the
  // first one is still in flight.
  const submittingRef = useRef(false);

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    submittingRef.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit({
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
      });
    } catch (err) {
      setFormError(err?.message || "Couldn't save this product.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Title</label>
        <input
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {errors.title && <p className="mt-1 text-xs text-rust">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Category</label>
          <input
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            list="category-suggestions"
            placeholder="e.g. beauty"
            className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <datalist id="category-suggestions">
            {categories.map((c) => {
              const slug = typeof c === "string" ? c : c.slug;
              return <option key={slug} value={slug} />;
            })}
          </datalist>
          {errors.category && <p className="mt-1 text-xs text-rust">{errors.category}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Brand</label>
          <input
            value={values.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {errors.price && <p className="mt-1 text-xs text-rust">{errors.price}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Stock</label>
          <input
            type="number"
            value={values.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {errors.stock && <p className="mt-1 text-xs text-rust">{errors.stock}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Image URL</label>
        <input
          value={values.thumbnail}
          onChange={(e) => update("thumbnail", e.target.value)}
          placeholder="https://…"
          className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        {errors.thumbnail && <p className="mt-1 text-xs text-rust">{errors.thumbnail}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      {formError && <p className="text-sm text-rust">{formError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
