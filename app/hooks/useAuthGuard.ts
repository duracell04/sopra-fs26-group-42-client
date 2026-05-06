import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthSession } from "@/utils/authStorage";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { isAuthenticated } = getStoredAuthSession();

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [router]);
}

export function useRequireNoAuth() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { isAuthenticated } = getStoredAuthSession();

    if (isAuthenticated) {
      router.replace("/menu");
    }
  }, [router]);
}
