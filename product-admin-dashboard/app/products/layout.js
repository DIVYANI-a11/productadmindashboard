"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";

export default function ProductsLayout({ children }) {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "ready" && !isAuthenticated) {
      router.replace("/login");
    }
  }, [status, isAuthenticated, router]);

  if (status !== "ready") {
    return <Loader label="Checking your session" />;
  }

  if (!isAuthenticated) {
    // We're already redirecting; render nothing meanwhile.
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
