"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input, Space, Spin, Tag, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { GameSession } from "@/types/session";

const { Title, Text } = Typography;

const normalizeSessionCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

export default function JoinSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiService = useApi();
  const sessionCodeFromQuery = normalizeSessionCode(searchParams.get("code") ?? "");

  const [inputCode, setInputCode] = useState(sessionCodeFromQuery);
  const [session, setSession] = useState<GameSession | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(sessionCodeFromQuery));
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setInputCode(sessionCodeFromQuery);

    if (!sessionCodeFromQuery) {
      setSession(null);
      setError(null);
      setIsLoadingSession(false);
      return;
    }

    const loadSession = async () => {
      try {
        setIsLoadingSession(true);
        const result = await apiService.get<GameSession>(`/sessions/${sessionCodeFromQuery}`);
        setSession(result);
        setError(null);
      } catch (err) {
        setSession(null);
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoadingSession(false);
      }
    };

    loadSession();
  }, [apiService, sessionCodeFromQuery]);

  useEffect(() => {
    const code = session?.code;
    if (!code) {
      return;
    }

    const poll = async () => {
      try {
        const updated = await apiService.get<GameSession>(`/sessions/${code}`);
        setSession(updated);

        if (updated.status === "CANCELLED") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
          }
          alert("Session has expired or been cancelled.");
          router.push("/menu");
        } else if (updated.status === "ACTIVE") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
          }
          router.push("/play_test");
        }
      } catch {
        // Ignore transient polling errors while staying on the join lobby.
      }
    };

    pollRef.current = setInterval(poll, 3000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [apiService, router, session?.code]);

  const handleJoinSession = async () => {
    const code = normalizeSessionCode(inputCode);
    const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    const parsedId: string | null = rawId ? JSON.parse(rawId) : null;

    if (!parsedId) {
      router.push("/login");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await apiService.post(`/sessions/${code}/join`, {
        userId: Number(parsedId),
      });
      router.replace(`/session/join?code=${code}`);
    } catch (err) {
      setSession(null);
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (session) {
    const playerCount = session.players.length;

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0a0a", padding: 24 }}>
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
              Joined Session
            </Title>

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
                {session.code}
              </Text>
              <Text style={{ color: "#666", fontSize: 12, display: "block", marginTop: 8 }}>
                Waiting for the host to start the game
              </Text>
            </div>

            <div>
              <Text style={{ color: "#aaa", fontSize: 14, display: "block", marginBottom: 12 }}>
                Players ({playerCount}/2):
              </Text>
              <Space direction="vertical" style={{ width: "100%" }}>
                {session.players.map((player, idx) => (
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

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button type="primary" size="large" style={{ width: "100%" }} disabled>
                Only the host can start
              </Button>
              <Button size="large" style={{ width: "100%" }} onClick={() => router.push("/menu")}>
                Back to Menu
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0a0a", padding: 24 }}>
      <Card
        style={{
          width: 440,
          background: "#1a1a2e",
          border: "1px solid #16213e",
          borderRadius: 16,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} style={{ color: "#e0e0e0", textAlign: "center", marginBottom: 8 }}>
              Join Session
            </Title>
            <Text style={{ color: "#999", display: "block", textAlign: "center" }}>
              Enter a 6-character session code to join your friend&apos;s lobby.
            </Text>
          </div>

          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text style={{ color: "#aaa" }}>Session Code</Text>
            <Input
              value={inputCode}
              onChange={(event) => {
                setInputCode(normalizeSessionCode(event.target.value));
                if (error) {
                  setError(null);
                }
              }}
              maxLength={6}
              size="large"
              placeholder="ABC123"
              autoComplete="off"
              style={{
                textTransform: "uppercase",
                letterSpacing: 6,
                textAlign: "center",
                fontFamily: "monospace",
              }}
            />
            {error && (
              <Text type="danger">
                {error}
              </Text>
            )}
          </Space>

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Button
              type="primary"
              size="large"
              style={{ width: "100%" }}
              disabled={inputCode.length !== 6}
              loading={isJoining}
              onClick={handleJoinSession}
            >
              Join Session
            </Button>
            <Button size="large" style={{ width: "100%" }} onClick={() => router.push("/menu")}>
              Back to Menu
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
