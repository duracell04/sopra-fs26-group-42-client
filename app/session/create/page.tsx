"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Space, Typography, Tag, Spin } from "antd";
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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16, background: "#0a0a0a" }}>
        <Text type="danger" style={{ fontSize: 16 }}>Error: {error}</Text>
        <Button onClick={() => router.push("/menu")}>Back to Menu</Button>
      </div>
    );
  }

  const playerCount = session?.players?.length ?? 0;
  const canStart = playerCount === 2;
  const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const currentUserId = rawId ? Number(JSON.parse(rawId)) : null;
  const isCreator = session?.creatorId === currentUserId;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a" }}>
      <Card
        style={{
          width: 480,
          background: "#1a1a2e",
          border: "1px solid #16213e",
          borderRadius: 16,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ color: "#e0e0e0", textAlign: "center", margin: 0 }}>
            Game Session
          </Title>

          {/* Session Code */}
          <div
            style={{
              textAlign: "center",
              padding: "24px",
              background: "#16213e",
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 8, letterSpacing: 2 }}>
              SESSION CODE
            </Text>
            <Text
              style={{
                color: "#00d4ff",
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: 12,
                fontFamily: "monospace",
                display: "block",
              }}
            >
              {session?.code}
            </Text>
            <Text style={{ color: "#666", fontSize: 12, display: "block", marginTop: 8 }}>
              Share this code with your friend
            </Text>
          </div>

          {/* Expiry countdown (only when waiting with 1 player) */}
          {session?.status === "WAITING" && playerCount < 2 && (
            <div style={{ textAlign: "center" }}>
              <Text style={{ color: timeLeft < 60 ? "#ff4d4f" : "#faad14", fontSize: 14 }}>
                Session expires in: <strong>{formatTime(timeLeft)}</strong>
              </Text>
            </div>
          )}

          {/* Players list */}
          <div>
            <Text style={{ color: "#aaa", fontSize: 14, display: "block", marginBottom: 12 }}>
              Players ({playerCount}/2):
            </Text>
            <Space direction="vertical" style={{ width: "100%" }}>
              {session?.players?.map((player, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    background: "#16213e",
                    borderRadius: 8,
                  }}
                >
                  <Tag color={idx === 0 ? "blue" : "green"}>
                    {idx === 0 ? "Host" : "Player 2"}
                  </Tag>
                  <Text style={{ color: "#e0e0e0" }}>{player}</Text>
                </div>
              ))}
              {playerCount < 2 && (
                <div
                  style={{
                    padding: "10px 16px",
                    background: "#0d0d1a",
                    borderRadius: 8,
                    border: "1px dashed #333",
                  }}
                >
                  <Text style={{ color: "#555" }}>Waiting for player 2 to join...</Text>
                </div>
              )}
            </Space>
          </div>

          {/* Action buttons */}
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Button
              type="primary"
              size="large"
              style={{
                width: "100%",
                ...(canStart && isCreator ? { backgroundColor: "#52c41a", borderColor: "#52c41a" } : {}),
              }}
              disabled={!canStart || !isCreator}
              onClick={handleStartGame}
            >
              {!isCreator
                ? "Only the host can start"
                : canStart
                ? "Start Game"
                : "Waiting for players..."}
            </Button>

            <Button danger size="large" style={{ width: "100%" }} onClick={handleCancel}>
              Cancel Session
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
