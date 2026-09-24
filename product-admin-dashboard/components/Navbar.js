"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/products" className="text-sm font-semibold text-ink">
          Product admin
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-ink/60 sm:inline">
              Signed in as {user.username}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
