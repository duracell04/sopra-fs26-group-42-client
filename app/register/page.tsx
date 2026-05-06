"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { clearStoredAuthSession } from "@/utils/authStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import { useState } from "react";

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("id", "");
  const { set: setUsername } = useLocalStorage<string>("username", "");

  const handleRegister = async (values: { username: string; password: string; name: string }) => {
    try {
      setError(null);
      const response = await apiService.post<User>("/users", values);

      if (!response.token || !response.id || !response.username) {
        throw new Error("Registration did not return a complete session.");
      }

      clearStoredAuthSession();
      setToken(response.token);
      setUserId(String(response.id));
      setUsername(response.username);

      router.replace("/menu");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 8, marginBottom: 20,
            backgroundColor: "#2a0a0a", border: "1px solid #ff4d4f",
            color: "#ff7875", fontWeight: 600, fontSize: 15,
          }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            Error: {error}
          </div>
        )}
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Name is required" },
          ]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: "Username is required" },
            { min: 3, message: "Username must be at least 3 characters" },
            { max: 20, message: "Username must not exceed 20 characters" },
          ]}
        >
          <Input placeholder="Enter username (3-20 chars)" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 6, message: "Password must be at least 6 characters" },
            { max: 16, message: "Password must not exceed 16 characters" },
          ]}
        >
          <Input.Password placeholder="Enter password (6-16 chars)" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="register-button" block>
            Register
          </Button>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
          <Button type="link" onClick={() => router.push("/login")} style={{ padding: 0 }}>
            Already have an account? Login
          </Button>
        </Form.Item>
      </Form>
      </div>
    </div>
  );
};

export default Register;
