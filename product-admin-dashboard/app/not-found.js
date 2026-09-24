import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-lg font-semibold text-ink">Page not found</p>
      <p className="text-sm text-ink/60">That page doesn't exist.</p>
      <Link href="/products" className="mt-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">
        Go to products
      </Link>
    </main>
  );
}
