"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, Alert } from "antd";
import { useState } from "react";

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const { set: setToken } = useLocalStorage<string>("token", "");

  // automatic log in after successful registration
  const handleRegister = async (values: { username: string; password: string }) => {
    try {
      setError(null);
      const response = await apiService.post<User>("/users", values);

      if (response.token) {
        setToken(response.token);
      }

      router.push("/users");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during registration.");
      }
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h1>Register</h1>
      {error && <Alert message="Registration Error" description={error} type="error" showIcon style={{ marginBottom: "20px" }} />}
      <Form
        form={form}
        name="register"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
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
      </Form>
    </div>
  );
};

export default Register;
