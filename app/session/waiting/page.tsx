"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { GameSession } from "@/types/session";
import { Button, Card, Space, Tag, Typography, Spin } from "antd";

const { Title, Text } = Typography;

function WaitingSessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const apiService = useApi();

  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleLeave = async () => {
    const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    const userId = rawId ? JSON.parse(rawId) : null;
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a" }}>
        <Spin size="large" />
      </div>
    );
  }

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
            Waiting for Host
          </Title>

          <div style={{ textAlign: "center", padding: "16px", background: "#16213e", borderRadius: 12 }}>
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
              {code}
            </Text>
          </div>

          <div>
            <Text style={{ color: "#aaa", fontSize: 14, display: "block", marginBottom: 12 }}>
              Players ({session?.players?.length ?? 0}/2):
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
            </Space>
          </div>

          <Text style={{ color: "#faad14", textAlign: "center", display: "block" }}>
            Waiting for the host to start the game...
          </Text>

          <Button danger size="large" style={{ width: "100%" }} onClick={handleLeave}>
            Leave Session
          </Button>
        </Space>
      </Card>
    </div>
  );
}

function WaitingSessionFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a" }}>
      <Spin size="large" />
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
