"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const id = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    if (token && id) {
      router.replace("/menu");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
