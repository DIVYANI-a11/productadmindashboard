"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function Home() {
  const { isAuthenticated, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "ready") return;
    router.replace(isAuthenticated ? "/products" : "/login");
  }, [status, isAuthenticated, router]);

  return <Loader label="Loading" />;
}
