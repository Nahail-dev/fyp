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
            className="w-full py-3 bg-primary text-white rounded-sm"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
