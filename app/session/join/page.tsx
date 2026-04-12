"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input, Space, Typography } from "antd";
import { useApi } from "@/hooks/useApi";
const { Title, Text } = Typography;

const normalizeSessionCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

export default function JoinSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiService = useApi();

  const [inputCode, setInputCode] = useState(normalizeSessionCode(searchParams.get("code") ?? ""));
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

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
