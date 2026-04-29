"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/app/profile");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Prevent multiple submissions
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Login successful");
      router.push("/app/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Mail className="w-8 h-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-foreground">
              Yuubin
            </span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your letter journey
          </p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="postal-card p-8 space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <Link href="#" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-serif font-bold py-3 rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">or</span>
          </div>
        </div>

        {/* Social Login (placeholder) */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
            className="postal-card px-4 py-3 rounded-sm border-2 border-border hover:border-primary/50 transition-all text-sm font-medium text-foreground"
          >
            Google
          </button>

          <button
            disabled
            className="postal-card px-4 py-3 rounded-sm border-2 border-border opacity-50 text-sm font-medium text-foreground"
          >
            Apple (Soon)
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="#" className="hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
