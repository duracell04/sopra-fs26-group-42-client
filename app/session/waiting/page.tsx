"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { getStoredAuthenticatedUserId } from "@/utils/authStorage";
import { GameSession } from "@/types/session";
import { getSessionTimeLeftSeconds } from "@/utils/sessionTime";
import { Button, Card, Space, Typography, Spin } from "antd";

const { Title, Text } = Typography;

function WaitingSessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const apiService = useApi();

  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Initial fetch
  useEffect(() => {
    if (!code) {
      router.push("/menu");
      return;
    }

    const fetchSession = async () => {
      try {
        const data = await apiService.get<GameSession>(`/sessions/${code}`);
        setSession(data);
      } catch {
        router.push("/menu");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Poll every 3 seconds
  useEffect(() => {
    if (!code) return;

    const poll = async () => {
      try {
        const updated = await apiService.get<GameSession>(`/sessions/${code}`);
        setSession(updated);

        if (updated.status === "ACTIVE") {
          clearInterval(pollRef.current!);
          router.push(`/play_test?code=${code}`);
        } else if (updated.status === "CANCELLED") {
          clearInterval(pollRef.current!);
          alert("Session was cancelled by the host.");
          router.push("/menu");
        }
      } catch {
        // ignore transient errors
      }
    };

    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [code, apiService, router]);

  useEffect(() => {
    if (!session?.expiresAt || session.status !== "WAITING") return;

    const updateTimeLeft = () => {
      setTimeLeft(getSessionTimeLeftSeconds(session));
    };

    updateTimeLeft();
    timerRef.current = setInterval(updateTimeLeft, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.expiresAt, session?.status]);

  const handleLeave = async () => {
    const userId = getStoredAuthenticatedUserId();

    if (!userId) {
      router.replace("/login");
      return;
    }

    try {
      await apiService.delete(`/sessions/${code}?userId=${userId}`);
    } catch {
      // session might already be gone
    } finally {
      router.push("/menu");
    }
  };

  if (loading) {
    return (
      <div className="session-simple-shell">
        <Card className="session-simple-card">
          <Space orientation="vertical" size="middle" align="center">
            <Spin size="large" />
            <Text className="session-simple-subtitle">Joining session...</Text>
          </Space>
        </Card>
      </div>
    );
  }

  const playerCount = session?.players?.length ?? 0;

  return (
    <div className="session-simple-shell">
      <Card className="session-simple-card">
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <button
              type="button"
              onClick={handleLeave}
              style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14, padding: "0 0 8px 0" }}
            >
              ← Back to Menu
            </button>
            <Title level={2} className="session-simple-title">
              Waiting for Host
            </Title>
            <Text className="session-simple-subtitle">
              The host will start the game once everyone is ready.
            </Text>
          </div>

          <div className="session-simple-code-box">
            <Text className="session-simple-label">Session Code</Text>
            <div className="session-simple-code">{code}</div>
          </div>

          <div className="session-simple-info-list">
            <div className="session-simple-info-row">
              <Text className="session-simple-info-label">Status</Text>
              <Text className="session-simple-info-value">Waiting</Text>
            </div>
            <div className="session-simple-info-row">
              <Text className="session-simple-info-label">Players</Text>
              <Text className="session-simple-info-value">{playerCount}/2</Text>
            </div>
            <div className="session-simple-info-row">
              <Text className="session-simple-info-label">Expires In</Text>
              <Text className="session-simple-info-value">{formatTime(timeLeft)}</Text>
            </div>
          </div>

          <div className="session-simple-section">
            <Text className="session-simple-section-title">Players</Text>
            <Space orientation="vertical" size="small" style={{ width: "100%" }}>
              {session?.players?.map((player, idx) => (
                <div key={idx} className="session-simple-player-row">
                  <Text className="session-simple-player-role">{idx === 0 ? "Host" : "Player 2"}</Text>
                  <Text className="session-simple-player-name">{player}</Text>
                </div>
              ))}
              {playerCount < 2 && (
                <div className="session-simple-player-row">
                  <Text className="session-simple-player-role">Open</Text>
                  <Text className="session-simple-player-name session-simple-player-name-muted">Waiting for player 2</Text>
                </div>
              )}
            </Space>
          </div>

          <Text className="session-simple-status-note">
            Waiting for the host to start the game...
          </Text>

          <Button size="large" className="session-simple-secondary-button" onClick={handleLeave}>
            Leave Session
          </Button>
        </Space>
      </Card>
    </div>
  );
}

function WaitingSessionFallback() {
  return (
    <div className="session-simple-shell">
      <Card className="session-simple-card">
        <Space orientation="vertical" size="middle" align="center">
          <Spin size="large" />
          <Text className="session-simple-subtitle">Loading session...</Text>
        </Space>
      </Card>
    </div>
  );
}

export default function WaitingSessionPage() {
  return (
    <Suspense fallback={<WaitingSessionFallback />}>
      <WaitingSessionPageContent />
    </Suspense>
  );
}
