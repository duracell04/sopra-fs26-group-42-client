"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { GameSession } from "@/types/session";
import { Button, Card, Input, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function JoinSessionPage() {
  const router = useRouter();
  const apiService = useApi();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    const rawId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
    const userId = rawId ? Number(JSON.parse(rawId)) : null;

    if (!userId) {
      router.push("/login");
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Please enter a session code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.post<GameSession>(`/sessions/${trimmedCode}/join`, {
        userId,
      });
      router.push(`/session/waiting?code=${trimmedCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a" }}>
      <Card
        style={{
          width: 420,
          background: "#1a1a2e",
          border: "1px solid #16213e",
          borderRadius: 16,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ color: "#e0e0e0", textAlign: "center", margin: 0 }}>
            Join Session
          </Title>

          <div>
            <Text style={{ color: "#aaa", fontSize: 13, display: "block", marginBottom: 8 }}>
              Enter the 6-character session code:
            </Text>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onPressEnter={handleJoin}
              maxLength={6}
              placeholder="e.g. ABC123"
              style={{
                background: "#16213e",
                border: "1px solid #333",
                color: "#e0e0e0",
                fontSize: 24,
                textAlign: "center",
                letterSpacing: 8,
                fontFamily: "monospace",
                height: 56,
              }}
            />
          </div>

          {error && (
            <Text type="danger" style={{ fontSize: 13 }}>
              {error}
            </Text>
          )}

          <Space style={{ width: "100%" }} size="middle">
            <Button
              size="large"
              style={{ flex: 1 }}
              onClick={() => router.push("/menu")}
            >
              Back
            </Button>
            <Button
              type="primary"
              size="large"
              style={{ flex: 1 }}
              loading={loading}
              disabled={code.trim().length !== 6}
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
