"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Space, Spin, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { GameSession } from "@/types/session";

const { Title, Text } = Typography;

export default function CreateSessionPage() {
  const router = useRouter();
  const apiService = useApi();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);

  const createdRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionCodeRef = useRef<string | null>(null);

  // Create the session on mount — read localStorage directly to avoid async hook delay
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    const parsedId: string | null = rawId ? JSON.parse(rawId) : null;

    if (!parsedId) {
      router.push("/login");
      return;
    }

    const create = async () => {
      try {
        const result = await apiService.post<GameSession>("/sessions", {
          creatorId: Number(parsedId),
        });
        setSession(result);
        sessionCodeRef.current = result.code;

        const expiry = new Date(result.expiresAt).getTime();
        setTimeLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
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
          alert("Session has expired or been cancelled.");
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
      const expiry = new Date(session.expiresAt).getTime();
      const secs = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(secs);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.expiresAt, session?.status]);

  const handleCancel = async () => {
    if (!session) return;
    const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    const parsedId: string | null = rawId ? JSON.parse(rawId) : null;
    try {
      await apiService.delete(`/sessions/${session.code}?userId=${parsedId}`);
    } catch {
      // session might already be gone
    } finally {
      router.push("/menu");
    }
  };

  const handleStartGame = async () => {
    if (!session) return;
    const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    const parsedId: string | null = rawId ? JSON.parse(rawId) : null;
    try {
      await apiService.post(`/sessions/${session.code}/start`, {
        userId: Number(parsedId),
      });
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/play_test?code=${session.code}`);
    } catch (err) {
      alert(`Failed to start game: ${err instanceof Error ? err.message : "Unknown error"}`);
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
          <Space direction="vertical" size="middle" align="center">
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
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={2} className="session-simple-title">
                Create Session
              </Title>
              <Text className="session-simple-subtitle">
                We couldn&apos;t open the session.
              </Text>
            </div>

            <Alert message={error} type="error" showIcon />

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
  const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const currentUserId = rawId ? Number(JSON.parse(rawId)) : null;
  const isCreator = session?.creatorId === currentUserId;

  return (
    <div className="session-simple-shell">
      <Card className="session-simple-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
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

          <div className="session-simple-info-list">
            <div className="session-simple-info-row">
              <Text className="session-simple-info-label">Status</Text>
              <Text className="session-simple-info-value">{getStatusLabel(session?.status)}</Text>
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
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
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

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Button
              type="primary"
              size="large"
              className="session-simple-primary-button"
              disabled={!canStart || !isCreator}
              onClick={handleStartGame}
            >
              {!isCreator
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
