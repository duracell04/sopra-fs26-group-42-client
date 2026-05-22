"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { clearStoredAuthSession } from "@/utils/authStorage";
import { ApplicationError } from "@/types/error";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { useState } from "react";

const isApplicationError = (err: unknown): err is ApplicationError =>
  err instanceof Error &&
  "status" in err &&
  typeof (err as ApplicationError).status === "number";

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
      setError(null);
      const response = await apiService.post<User>("/users/login", values);

      if (!response.token || !response.id || !response.username) {
        throw new Error("Login did not return a complete session.");
      }

      clearStoredAuthSession();
      setToken(response.token);
      setUserId(String(response.id));
      setUsername(response.username);

      router.replace("/menu");
    } catch (err) {
      if (isApplicationError(err) && err.status === 401) {
        setError("Invalid username or password.");
        return;
      }

      setError(err instanceof Error ? err.message : "An unknown error occurred during login.");
    }
  };

  return (
    <div className="login-container">
      <div className="auth-shell">
        <h1 className="menu-title-screen">Math Invaders</h1>
      <div className="login-card">
        {error && (
          <div className="session-simple-error-box" style={{ marginBottom: 16 }}>
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
    </div>
  );
};

export default Login;
