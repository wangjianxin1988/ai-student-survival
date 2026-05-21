import React, { useState, useEffect } from "react";
import {
  verifyPassword,
  isPasswordVerified,
  setPasswordVerified,
} from "@/lib/passwordAuth";

interface PasswordGateProps {
  children: React.ReactNode;
  onVerified?: () => void;
}

export function PasswordGate({ children, onVerified }: PasswordGateProps) {
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already verified on mount
    if (isPasswordVerified()) {
      setVerified(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay for security
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (verifyPassword(password)) {
      setPasswordVerified();
      setVerified(true);
      onVerified?.();
    } else {
      setError("密码错误，请重试");
      setPassword("");
    }

    setIsLoading(false);
  };

  // If already verified, render children
  if (verified) {
    return <>{children}</>;
  }

  // Password entry form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MI TO AI</h1>
          <p className="text-gray-600">请输入访问密码</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                访问密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="请输入密码"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "验证中..." : "进入网站"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          演示模式密码保护 | 密码由管理员提供
        </p>
      </div>
    </div>
  );
}

export default PasswordGate;
