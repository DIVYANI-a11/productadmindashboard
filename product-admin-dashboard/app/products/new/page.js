"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { addProduct, fetchCategories } from "@/lib/api/products";
import { recordAdd } from "@/lib/localOverrides";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  async function handleSubmit(values) {
    // DummyJSON's /products/add responds with a fake success (it always
    // echoes back id: 195 and doesn't actually save anything server
    // side). We still send the request so the network call is real and
    // visible, but the product that actually shows up afterwards comes
    // from our local overrides layer - see lib/localOverrides.js.
    const response = await addProduct(values);
    recordAdd({ ...values, thumbnail: values.thumbnail || response.thumbnail || "" });
    router.push("/products");
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/products" className="text-sm text-brand-600 hover:underline">
        ← Back to products
      </Link>
      <div className="mt-4 rounded-md border border-line bg-white p-5 shadow-card">
        <h1 className="text-lg font-semibold text-ink">Add product</h1>
        <p className="mt-1 text-sm text-ink/60">
          The demo API doesn't really save new products, so this one is kept in your browser for this session.
        </p>
        <div className="mt-5">
          <ProductForm categories={categories} initialValues={{}} submitLabel="Add product" onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
