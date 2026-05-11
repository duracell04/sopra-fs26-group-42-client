"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Space, Typography } from "antd";
import UserStatusButton from "@/components/UserStatusButton";
import { useApi } from "@/hooks/useApi";
import { useRequireAuth } from "@/hooks/useAuthGuard";
import { clearStoredAuthSession, getStoredAuthSession } from "@/utils/authStorage";

const { Title, Text } = Typography;

export default function MenuPage() {
  const router = useRouter();
  const apiService = useApi();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useRequireAuth();

  const handleLogout = async () => {
    const { userId } = getStoredAuthSession();

    setIsLoggingOut(true);
    try {
      if (userId) {
        await apiService.put(`/users/${userId}/logout`, {});
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Logout request failed:", error.message);
      }
    } finally {
      clearStoredAuthSession();
      setIsLoggingOut(false);
      router.replace("/login");
    }
  };

  return (
    <div className="menu-container">
      <UserStatusButton />
      <Card className="menu-card">
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} className="menu-title">
              Math Invaders
            </Title>
          </div>

          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <Button
              type="primary"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/session/create")}
            >
              Create Multiplayer Session
            </Button>

            <Button
              type="primary"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/session/join")}
            >
              Join Session
            </Button>

            <Button
              type="default"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/profile")}
            >
              My Profile
            </Button>

            <Button
              type="default"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/menu/how-to-play")}
            >
              How to Play
            </Button>

            <Button
              type="default"
              variant="solid"
              className="menu-button"
              loading={isLoggingOut}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
