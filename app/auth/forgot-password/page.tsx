"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { HCaptchaChallenge, resetHCaptcha } from "@/components/hcaptcha-challenge";
import { createClient } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (!captchaToken) {
        toast.error("Please complete the captcha");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
        captchaToken,
      });

      if (error) {
        toast.error(error.message);
        resetHCaptcha();
        setCaptchaToken("");
        return;
      }

      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.log("[auth/forgot-password] reset email failed:", error);
      toast.error("Could not send reset email. Please try again.");
      resetHCaptcha();
      setCaptchaToken("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
          <div className="pt-4">
            <Mail className="mx-auto h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Forgot Password
          </h1>
          <p className="text-muted-foreground">
            Enter your email and we will send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="postal-card p-8 space-y-6">
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
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-sm border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          <HCaptchaChallenge
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken("")}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-serif font-bold py-3 rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Send Reset Link
                <Send className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
