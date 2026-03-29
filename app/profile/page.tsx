"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Space, Typography, Spin, Alert } from "antd";

const { Title, Text } = Typography;

interface UserProfile {
  username: string;
  joinDate: string;
  highestScore: number;
  totalScore: number;
  timePlayed: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const apiService = useApi();

  const { value: userId } = useLocalStorage<string>("userId", "");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId) {
          throw new Error("No user id found. Please log in first.");
        }

        const response = await apiService.get<UserProfile>(`/users/${userId}/profile`);
        setProfile(response);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading the profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiService, userId]);

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} className="profile-title">
            User Profile
          </Title>

          {loading && <Spin size="large" />}

          {!loading && error && (
            <Alert
              message="Could not load user profile"
              description={error}
              type="error"
              showIcon
            />
          )}

          {!loading && profile && (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Text className="profile-text">
                <strong>Username:</strong> {profile.username}
              </Text>
              <Text className="profile-text">
                <strong>Joining Date:</strong> {profile.joinDate}
              </Text>
              <Text className="profile-text">
                <strong>Highest Score:</strong> {profile.highestScore}
              </Text>
              <Text className="profile-text">
                <strong>Total Score:</strong> {profile.totalScore}
              </Text>
              <Text className="profile-text">
                <strong>Time Played:</strong> {profile.timePlayed}
              </Text>
            </Space>
          )}

          <Button
            type="primary"
            className="profile-button"
            onClick={() => router.push("/menu")}
          >
            Back
          </Button>
        </Space>
      </Card>
    </div>
  );
}