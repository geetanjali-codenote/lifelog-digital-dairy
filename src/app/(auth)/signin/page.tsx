"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

const NEXTAUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Could not start the sign-in flow. Please try again.",
  OAuthCallback: "Something went wrong during sign-in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method. Use your original method.",
  Callback: "Something went wrong. Please try again.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Configuration: "There is a server configuration problem. Please contact support.",
  Default: "An unexpected error occurred. Please try again.",
};

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Pick up NextAuth error from URL (e.g. /signin?error=OAuthCallback)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(NEXTAUTH_ERRORS[urlError] || NEXTAUTH_ERRORS.Default);
    }
  }, [searchParams]);

  const handleSocialSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);
      setError("");
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setError(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoadingProvider("credentials");
      setError("");
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] lg:bg-white dark:bg-surface px-6 py-8 overflow-y-auto min-h-screen lg:justify-center lg:items-center">
      <div className="flex-1 mt-8 lg:flex-none lg:mt-0 lg:w-full lg:max-w-[420px]">
        <FadeIn>
          {/* App Logo — mobile only */}
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand" strokeWidth={2} />
            </div>
          </div>

          {/* Titles */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 lg:hidden">LifeLog</h1>
            <h1 className="hidden lg:block text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome back</h1>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-[260px] mx-auto leading-relaxed">
              Capture your journey, one day at a time.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10.02H12V14.24H17.93C17.67 15.61 16.89 16.79 15.75 17.55V20.32H19.31C21.4 18.4 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.02 19.31 20.32L15.75 17.55C14.75 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.84 14.07H2.17V16.92C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
                <path d="M5.84 14.07C5.62 13.4 5.5 12.71 5.5 12C5.5 11.29 5.62 10.6 5.84 9.93V7.08H2.17C1.42 8.57 1 10.23 1 12C1 13.77 1.42 15.43 2.17 16.92L5.84 14.07Z" fill="#FBBC05" />
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.03L19.38 3.86C17.46 2.06 14.97 1 12 1C7.7 1 3.99 3.47 2.17 7.08L5.84 9.93C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {loadingProvider === "google" ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialSignIn("facebook")}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3.5 bg-[#1877F2] rounded-xl hover:bg-[#166FE5] transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold text-white">
                {loadingProvider === "facebook" ? "Signing in..." : "Continue with Facebook"}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#FAFAFA] lg:bg-white dark:bg-surface px-4 text-gray-400 font-medium tracking-wide">OR SIGN IN WITH EMAIL</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-gray-400 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all placeholder:text-gray-400 text-gray-900 dark:text-white tracking-widest disabled:opacity-50"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium shadow-md shadow-brand/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProvider === "credentials" ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </FadeIn>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 pb-2 lg:mt-6 lg:w-full lg:max-w-[420px]">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 px-4">
          By continuing, you agree to LifeLog&apos;s{" "}
          <a href="#" className="underline">Terms</a> and{" "}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
