"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function UserStatusButton() {
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: username } = useLocalStorage<string>("username", "");

  const isLoggedIn = Boolean(token);
  const displayName = username // || "Guest";
  const statusLabel = isLoggedIn ? "Logged In" : "Logged Out";

  return (
    <button
      type="button"
      className="user-status-btn"
      onClick={() => router.push("/profile")}
      title="View Profile"
    >
      <span className="user-status-name">{displayName}</span>
      <span
        className={`user-status-badge ${
          isLoggedIn ? "user-status-badge--on" : "user-status-badge--off"
        }`}
      >
        {statusLabel}
      </span>
    </button>
  );
}
