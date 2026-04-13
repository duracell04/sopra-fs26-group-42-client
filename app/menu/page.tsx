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
              Main Menu
            </Title>
            <Text className="menu-subtitle">
              Choose an action to continue.
            </Text>
          </div>

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Button
              type="primary"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/profile")}
            >
              User Profile
            </Button>

            <Button
              type="primary"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/session/create")}
            >
              Create Session
            </Button>

            <Button
              type="primary"
              variant="solid"
              className="menu-button"
              onClick={() => router.push("/play_test")}
            >
              Play Test

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