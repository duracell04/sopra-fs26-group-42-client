"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Space, Spin, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { getStoredAuthenticatedUserId } from "@/utils/authStorage";
import { GameSession } from "@/types/session";
import { getSessionTimeLeftSeconds } from "@/utils/sessionTime";

const { Title, Text } = Typography;

export default function CreateSessionPage() {
  const router = useRouter();
  const apiService = useApi();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  const createdRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCodeRef = useRef<string | null>(null);

  // Create the session on mount — read localStorage directly to avoid async hook delay
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const userId = getStoredAuthenticatedUserId();

    if (!userId) {
      router.replace("/login");
      return;
    }

    const create = async () => {
      try {
        const result = await apiService.post<GameSession>("/sessions", {
          creatorId: userId,
        });
        setSession(result);
        sessionCodeRef.current = result.code;
        setTimeLeft(getSessionTimeLeftSeconds(result));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create session");
      } finally {
        setLoading(false);
      }
    };

    create();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll session state every 3 seconds
  useEffect(() => {
    if (!sessionCodeRef.current) return;

    const poll = async () => {
      try {
        const updated = await apiService.get<GameSession>(
          `/sessions/${sessionCodeRef.current}`
        );
        setSession(updated);

        if (updated.status === "CANCELLED") {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          router.push("/menu");
        } else if (updated.status === "ACTIVE") {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          router.push(`/play_test?code=${sessionCodeRef.current}`);
        }
      } catch {
        // ignore transient errors
      }
    };

    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [session?.code, apiService, router]);

  // Countdown timer
  useEffect(() => {
    if (!session?.expiresAt || session.status !== "WAITING") return;

    timerRef.current = setInterval(() => {
      const secondsLeft = getSessionTimeLeftSeconds(session);
      setTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        setIsExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.expiresAt, session?.status]);

  const handleCancel = async () => {
    if (!session) return;
    const userId = getStoredAuthenticatedUserId();

    if (!userId) {
      router.replace("/login");
      return;
    }

    try {
      await apiService.delete(`/sessions/${session.code}?userId=${userId}`);
    } catch {
      // session might already be gone
    } finally {
      router.push("/menu");
    }
  };

  const handleStartGame = async () => {
    if (!session) return;
    const userId = getStoredAuthenticatedUserId();

    if (!userId) {
      router.replace("/login");
      return;
    }

    try {
      await apiService.post(`/sessions/${session.code}/start`, {
        userId,
      });
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/play_test?code=${session.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getStatusLabel = (status?: GameSession["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Waiting";
    }
  };

  if (loading) {
    return (
      <div className="session-simple-shell">
        <Card className="session-simple-card">
          <Space orientation="vertical" size="middle" align="center">
            <Spin size="large" />
            <Text className="session-simple-subtitle">Creating your session...</Text>
          </Space>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-simple-shell">
        <Card className="session-simple-card">
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={2} className="session-simple-title">
                Create Session
              </Title>
              <Text className="session-simple-subtitle">
                We couldn&apos;t open the session.
              </Text>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 8,
              backgroundColor: "#2a0a0a", border: "1px solid #ff4d4f",
              color: "#ff7875", fontWeight: 600, fontSize: 15,
            }}>
              <span style={{ fontSize: 18 }}>⚠</span>
              Error: {error}
            </div>

            <Button className="session-simple-secondary-button" size="large" onClick={() => router.push("/menu")}>
              Back to Menu
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  const playerCount = session?.players?.length ?? 0;
  const canStart = playerCount === 2;
  const currentUserId = getStoredAuthenticatedUserId();
  const isCreator = session?.creatorId === currentUserId;

  return (
    <div className="session-simple-shell">
      <Card className="session-simple-card">
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <button
              type="button"
              onClick={handleCancel}
              style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14, padding: "0 0 8px 0" }}
            >
              ← Back to Menu
            </button>
            <Title level={2} className="session-simple-title">
              Create Session
            </Title>
            <Text className="session-simple-subtitle">
              Share the code with your friend and start when both players are here.
            </Text>
          </div>

          <div className="session-simple-code-box">
            <Text className="session-simple-label">Session Code</Text>
            <div className="session-simple-code">{session?.code}</div>
          </div>

          <div className="session-simple-timer-card">
            <Text className="session-simple-timer-label">Session Expires In</Text>
            <div className="session-simple-timer-value">{formatTime(timeLeft)}</div>
            <Text className="session-simple-timer-hint">
              This lobby closes automatically after 5 minutes.
            </Text>
            {isExpired && (
              <Text style={{ color: "#ff7875", marginTop: "12px", display: "block", fontWeight: 500 }}>
                Session expired. Create a new session to continue.
              </Text>
            )}
          </div>

          <div className="session-simple-info-list">
            <div className="session-simple-info-row">
              <Text className="session-simple-info-label">Status</Text>
              <Text className="session-simple-info-value">{getStatusLabel(session?.status)}</Text>
            </div>
            <div className="session-simple-info-row">
              <Text className="session-simple-info-label">Players</Text>
              <Text className="session-simple-info-value">{playerCount}/2</Text>
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

          <Space orientation="vertical" style={{ width: "100%" }} size="middle">
            <Button
              type="primary"
              size="large"
              className="session-simple-primary-button"
              disabled={!canStart || !isCreator || isExpired}
              onClick={handleStartGame}
            >
              {isExpired
                ? "Session expired"
                : !isCreator
                ? "Only the host can start"
                : canStart
                ? "Start Game"
                : "Waiting for players..."}
            </Button>

            <Button size="large" className="session-simple-secondary-button" onClick={handleCancel}>
              Cancel Session
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
