"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Space, Typography } from "antd";
import StarBackground from "@/components/StarBackground";
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
    <div className="menu-container menu-container--home">
      <UserStatusButton />
      <StarBackground />
      <Image
        src="/sprites/ship-host.png"
        alt=""
        width={160}
        height={96}
        className="menu-ship menu-ship--left"
        aria-hidden="true"
      />
      <Image
        src="/sprites/ship-joiner.png"
        alt=""
        width={160}
        height={96}
        className="menu-ship menu-ship--right"
        aria-hidden="true"
      />

      <div className="menu-grid-shell">
        <div className="menu-hero">
          <Title level={1} className="menu-title-screen">
            Math Invaders
          </Title>
          <Text className="menu-subtitle">
            Team up with your co-pilot, lock in the right factors, and defend the galaxy from number spaceships.
          </Text>
        </div>

        <Card className="menu-card menu-card--home">
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Text className="menu-panel-label">MENU</Text>

            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              <Button

                  type="primary"
                  variant="solid"
                  className="menu-button menu-button--main menu-button--create"
                  onClick={() => router.push("/session/create")}
                >
                  Create Multiplayer Session
                </Button>

              <Button

                  type="primary"
                  variant="solid"
                  className="menu-button menu-button--main menu-button--join"
                  onClick={() => router.push("/session/join")}
                >
                  Join Session
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
                onClick={() => router.push("/profile")}
              >
                My Profile
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

              <Text className="menu-hint-text">Tip: New pilot? Start with How to Play.</Text>
            </Space>
          </Space>

          <div className="menu-scanline" aria-hidden="true" />
        </Card>
      </div>
    </div>
  );
}
