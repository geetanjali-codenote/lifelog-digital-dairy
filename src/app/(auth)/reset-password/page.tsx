"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If missing query params, render error state immediately
  if (!token || !email) {
    return (
      <div className="text-center p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Invalid Link</h2>
        <p className="text-gray-500 text-sm">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="inline-block mt-4 text-brand font-semibold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to reset password");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully");
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-emerald-800 font-bold text-lg">Password Updated!</h3>
        <p className="text-emerald-600 text-sm mb-6">
          Your password has been successfully reset.
        </p>
        <Link href="/signin" className="inline-block mt-4 w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-md transition-all active:scale-[0.98]">
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 shadow-sm bg-white p-6 sm:p-8 rounded-2xl border border-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h1>
        <p className="text-sm text-gray-500">Pick a strong password for your account.</p>
        <p className="text-xs font-medium text-brand mt-1 truncate max-w-[250px] mx-auto">{email}</p>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-gray-400 text-gray-900 tracking-widest disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-gray-400 text-gray-900 tracking-widest disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || password.length < 8}
        className="w-full mt-2 py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium shadow-md shadow-brand/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] lg:bg-white dark:bg-surface px-6 py-8 overflow-y-auto min-h-screen lg:justify-center lg:items-center">
      <div className="flex-1 mt-8 lg:flex-none lg:mt-0 lg:w-full lg:max-w-[420px]">
        <FadeIn>
          <Suspense fallback={<div className="p-10 text-center animate-pulse text-gray-400 font-medium">Checking link validity...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </FadeIn>
      </div>
    </div>
  );
}
