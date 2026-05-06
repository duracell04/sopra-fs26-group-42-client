"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useRequireAuth } from "@/hooks/useAuthGuard";
import { clearStoredAuthSession, getStoredAuthSession } from "@/utils/authStorage";
import { Spin } from "antd";
import StarBackground from "@/components/StarBackground";

interface UserProfile {
  username: string;
  joinDate: string;
  highestScore: number;
  totalScore: number;
  timePlayed: number;
}

interface StatTileProps {
  label: string;
  value: string | number;
  color: string;
  icon: string;
}

function StatTile({ label, value, color, icon }: StatTileProps) {
  return (
    <div className="profile-stat-tile">
      <span className="profile-stat-icon">{icon}</span>
      <span className="profile-stat-value" style={{ color }}>
        {value}
      </span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

function formatTimePlayed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ProfilePage() {
  const router = useRouter();
  const apiService = useApi();
  useRequireAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { userId } = getStoredAuthSession();

    if (!userId) {
      clearStoredAuthSession();
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await apiService.get<UserProfile>(`/users/${userId}/profile`);
        setProfile(response);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading the profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiService, router]);

  return (
    <div className="profile-container">
      <StarBackground />

      <div className="profile-card">
        <button
          type="button"
          className="profile-back-btn"
          onClick={() => router.push("/menu")}
        >
          ← Back to Menu
        </button>

        {loading && (
          <div className="profile-loading">
            <Spin size="large" />
          </div>
        )}

        {!loading && error && (
          <div className="profile-error">
            <span className="profile-error-icon">⚠</span>
            <p className="profile-error-text">{error}</p>
          </div>
        )}

        {!loading && profile && (
          <>
            <div className="profile-avatar-area">
              <div className="profile-avatar">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <h2 className="profile-username">{profile.username}</h2>
              <span className="profile-join-date">Joined {profile.joinDate}</span>
            </div>

            <div className="profile-divider" />

            <div className="profile-stats-grid">
              <StatTile
                icon="🏆"
                label="Highest Score"
                value={profile.highestScore}
                color="#ffd786"
              />
              <StatTile
                icon="⭐"
                label="Total Score"
                value={profile.totalScore}
                color="#75bd9d"
              />
              <StatTile
                icon="⏱"
                label="Time Played"
                value={formatTimePlayed(profile.timePlayed)}
                color="#9fd3ff"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
