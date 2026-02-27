"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Mail, ChevronLeft, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send reset link");
        return;
      }

      setIsSuccess(true);
      toast.success("Reset link sent to your email");
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] lg:bg-white dark:bg-surface px-6 py-8 overflow-y-auto min-h-screen lg:justify-center lg:items-center">
      <div className="flex-1 mt-8 lg:flex-none lg:mt-0 lg:w-full lg:max-w-[420px]">
        <FadeIn>
          {/* Back Button */}
          <div className="mb-6 lg:mb-8">
            <Link href="/signin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>

          {/* Titles */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Forgot Password?</h1>
            <p className="text-base text-gray-500 max-w-[280px] mx-auto leading-relaxed">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-emerald-800 font-bold text-lg">Check your inbox</h3>
              <p className="text-emerald-600 text-sm">
                We&apos;ve sent a password reset link to <span className="font-semibold">{email}</span>. The link will expire in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-gray-400 text-gray-900 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium shadow-md shadow-brand/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
