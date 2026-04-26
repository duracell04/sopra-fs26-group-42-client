"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Card, Input, Space, Spin, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
import { GameSession } from "@/types/session";

const { Title, Text } = Typography;

const normalizeSessionCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

const formatErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function getStoredUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawId = localStorage.getItem("id");
  if (!rawId) {
    return null;
  }

  const parsedId = JSON.parse(rawId);
  const userId = Number(parsedId);
  return Number.isFinite(userId) ? userId : null;
}

function getStatusLabel(status?: GameSession["status"]) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Waiting";
  }
}

function JoinSessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiService = useApi();
  const queryCode = normalizeSessionCode(searchParams.get("code") ?? "");

  const [code, setCode] = useState(queryCode);
  const [session, setSession] = useState<GameSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(Boolean(queryCode));
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSessionState = (updatedSession: GameSession) => {
    if (updatedSession.status === "ACTIVE") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      router.push(`/play_test?code=${updatedSession.code}`);
      return;
    }

    if (updatedSession.status === "CANCELLED") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      router.push("/menu");
    }
  };

  useEffect(() => {
    setCode(queryCode);

    if (!queryCode) {
      setSession(null);
      setError(null);
      setLoadingSession(false);
      return;
    }

    const loadSession = async () => {
      setLoadingSession(true);
      setError(null);

      try {
        const loadedSession = await apiService.get<GameSession>(`/sessions/${queryCode}`);
        setSession(loadedSession);
        handleSessionState(loadedSession);
      } catch (err) {
        setSession(null);
        setError(formatErrorMessage(err, "Failed to load session."));
      } finally {
        setLoadingSession(false);
      }
    };

    void loadSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryCode, apiService]);

  useEffect(() => {
    if (!session?.code) {
      return;
    }

    const pollSession = async () => {
      try {
        const updatedSession = await apiService.get<GameSession>(`/sessions/${session.code}`);
        setSession(updatedSession);
        handleSessionState(updatedSession);
      } catch {
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
        router.push("/menu");
      }
    };

    pollRef.current = setInterval(pollSession, 3000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.code, apiService, router]);

  const handleJoin = async () => {
    const userId = getStoredUserId();

    if (!userId) {
      router.push("/login");
      return;
    }

    const trimmedCode = normalizeSessionCode(code);
    if (trimmedCode.length !== 6) {
      setError("Please enter a valid 6-character session code.");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const joinedSession = await apiService.post<GameSession>(
        `/sessions/${trimmedCode}/join`,
        { userId },
      );
      setSession(joinedSession);
      router.replace(`/session/join?code=${trimmedCode}`);
    } catch (err) {
      setSession(null);
      setError(formatErrorMessage(err, "Failed to join session."));
    } finally {
      setJoining(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="session-simple-shell">
        <Card className="session-simple-card">
          <Space direction="vertical" size="middle" align="center" style={{ width: "100%" }}>
            <Spin size="large" />
            <Text className="session-simple-subtitle">Loading session...</Text>
          </Space>
        </Card>
      </div>
    );
  }

  if (session) {
    const playerCount = session.players?.length ?? 0;

    return (
      <div className="session-simple-shell">
        <Card className="session-simple-card">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <button
                type="button"
                onClick={() => router.push("/menu")}
                style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 14, padding: "0 0 8px 0" }}
              >
                ← Back to Menu
              </button>
              <Title level={2} className="session-simple-title">
                Joined Session
              </Title>
              <Text className="session-simple-subtitle">
                Waiting for the host to start the game.
              </Text>
            </div>

            <div className="session-simple-code-box">
              <Text className="session-simple-label">Session Code</Text>
              <div className="session-simple-code">{session.code}</div>
            </div>

            <div className="session-simple-info-list">
              <div className="session-simple-info-row">
                <Text className="session-simple-info-label">Status</Text>
                <Text className="session-simple-info-value">{getStatusLabel(session.status)}</Text>
              </div>
              <div className="session-simple-info-row">
                <Text className="session-simple-info-label">Players</Text>
                <Text className="session-simple-info-value">{playerCount}/2</Text>
              </div>
            </div>

            <div className="session-simple-section">
              <Text className="session-simple-section-title">Players</Text>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                {session.players?.map((player, idx) => (
                  <div key={`${player}-${idx}`} className="session-simple-player-row">
                    <Text className="session-simple-player-role">
                      {idx === 0 ? "Host" : "Player 2"}
                    </Text>
                    <Text className="session-simple-player-name">{player}</Text>
                  </div>
                ))}
                {playerCount < 2 && (
                  <div className="session-simple-player-row">
                    <Text className="session-simple-player-role">Open</Text>
                    <Text className="session-simple-player-name session-simple-player-name-muted">
                      Waiting for player 2
                    </Text>
                  </div>
                )}
              </Space>
            </div>

            <Text className="session-simple-status-note">
              Only the host can start the game.
            </Text>

            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button
                type="primary"
                size="large"
                className="session-simple-primary-button"
                disabled
              >
                Only the host can start
              </Button>
              <Button
                size="large"
                className="session-simple-secondary-button"
                onClick={() => router.push("/menu")}
              >
                Back to Menu
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <div className="session-simple-shell">
      <Card className="session-simple-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} className="session-simple-title">
              Join Session
            </Title>
            <Text className="session-simple-subtitle">
              Enter the session code to join your friend&apos;s lobby.
            </Text>
          </div>

          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text className="session-simple-label">Session Code</Text>
            <Input
              value={code}
              onChange={(event) => {
                setCode(normalizeSessionCode(event.target.value));
                setError(null);
              }}
              onPressEnter={handleJoin}
              maxLength={6}
              placeholder="ABC123"
              size="large"
              autoComplete="off"
              style={{
                background: "#16213e",
                border: "1px solid #30456f",
                color: "#fff",
                fontSize: 24,
                textAlign: "center",
                letterSpacing: 8,
                fontFamily: "var(--font-geist-mono), monospace",
                height: 56,
              }}
            />
          </Space>

          {error && <Alert message={error} type="error" showIcon />}

          <Space style={{ width: "100%" }} size="middle">
            <Button
              size="large"
              className="session-simple-secondary-button"
              style={{ flex: 1 }}
              onClick={() => router.push("/menu")}
            >
              Back
            </Button>
            <Button
              type="primary"
              size="large"
              className="session-simple-primary-button"
              style={{ flex: 1 }}
              loading={joining}
              disabled={code.length !== 6}
              onClick={handleJoin}
            >
              Join
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}

function JoinSessionFallback() {
  return (
    <div className="session-simple-shell">
      <Card className="session-simple-card">
        <Space direction="vertical" size="middle" align="center" style={{ width: "100%" }}>
          <Spin size="large" />
          <Text className="session-simple-subtitle">Loading session...</Text>
        </Space>
      </Card>
    </div>
  );
}

export default function JoinSessionPage() {
  return (
    <Suspense fallback={<JoinSessionFallback />}>
      <JoinSessionPageContent />
    </Suspense>
  );
}
