"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} className="profile-title">
              User Profile
            </Title>
            <Text className="profile-subtitle">
              This screen will display the user profile information.
            </Text>
          </div>

          <Button
            type="primary"
            variant="solid"
            className="profile-button"
            onClick={() => router.push("/menu")}
          >
            Back to Main Menu
          </Button>
        </Space>
      </Card>
    </div>
  );
}