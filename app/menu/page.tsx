"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function MenuPage() {
  const router = useRouter();

  return (
    <div className="menu-container">
      <Card className="menu-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} className="menu-title">
              Math Invaders
            </Title>
            <Text className="menu-subtitle">
              Play solo or team up with a friend.
            </Text>
          </div>

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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
              type="primary"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/play_test")}
            >
              Solo Practice
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
              onClick={() => router.push("/login")}
            >
              Logout
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}