"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const lastSubmitRef = useRef(0); // ✅ cooldown
  const isSubmittingRef = useRef(false); // ✅ hard lock

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 HARD BLOCK (no double request)
    if (isSubmittingRef.current) return;

    // ⏱ COOLDOWN (2 sec)
    const now = Date.now();
    if (now - lastSubmitRef.current < 2000) {
      toast.error("Please wait a moment before trying again");
      return;
    }

    lastSubmitRef.current = now;
    isSubmittingRef.current = true;

    const { name, email, password, confirmPassword } = formData;

    // ✅ Validations
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      isSubmittingRef.current = false;
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      isSubmittingRef.current = false;
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept terms and conditions");
      isSubmittingRef.current = false;
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        // 🎯 Handle rate limit nicely
        if (error.message.toLowerCase().includes("rate")) {
          toast.error("Too many attempts. Please wait and try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // 📩 Email confirmation flow
      if (!data.session) {
        toast.success("📩 Check your email to confirm your account");
        return;
      }

      // ✅ Direct login case
      toast.success("Account created successfully");
      router.push("/app/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false; // 🔓 release lock
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
            Start Writing
          </h1>
          <p className="text-muted-foreground">
            Begin your mindful letter journey today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="postal-card p-8 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 py-3 border rounded-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 py-3 border rounded-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full py-3 border rounded-sm"
            required
          />

          {/* Confirm */}
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full py-3 border rounded-sm"
            required
          />

          {/* Terms */}
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span className="text-sm">I agree to Terms & Privacy Policy</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !agreeTerms}
            className="w-full py-3 bg-primary text-white rounded-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Account
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
            <span className="px-2 bg-background text-muted-foreground">or sign up with</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          onClick={() =>
            supabase.auth.signInWithOAuth({ 
              provider: "google",
              options: {
                redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
              }
            })
          }
          className="w-full postal-card px-4 py-3 rounded-sm border-2 border-border hover:border-primary/50 transition-all font-medium text-foreground flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        {/* Sign In Link */}
        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our{" "}
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
