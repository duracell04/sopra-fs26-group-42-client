"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { useState } from "react";

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("id", "");
  const { set: setUsername } = useLocalStorage<string>("username", "");

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const response = await apiService.post<User>("/users/login", values);

      if (response.token) {
        setToken(response.token);
      }

      if (response.id) {
        setUserId(String(response.id));
      }

      if (response.username) {
        setUsername(response.username);
      }

      router.push("/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Math Invaders</h1>
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 8, marginBottom: 16,
            backgroundColor: "#2a0a0a", border: "1px solid #ff4d4f",
            color: "#ff7875", fontWeight: 600, fontSize: 15,
          }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            Error: {error}
          </div>
        )}
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button" block>
            Login
          </Button>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
          <Button type="link" onClick={() => router.push("/register")} style={{ padding: 0 }}>
            No account? Register here
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
  );
};

export default Login;
