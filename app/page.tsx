"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearStoredAuthSession } from "@/utils/authStorage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    clearStoredAuthSession();
    router.replace("/login");
  }, [router]);

  return null;
}
