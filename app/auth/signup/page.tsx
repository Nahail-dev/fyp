"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock, Mail, MapPin, User, X } from "lucide-react";
import { HCaptchaChallenge, resetHCaptcha } from "@/components/hcaptcha-challenge";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CityOption {
  uuid_id: string;
  city: string;
  city_ascii?: string | null;
  country: string;
  admin_name?: string | null;
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  const lastSubmitRef = useRef(0); // ✅ cooldown
  const isSubmittingRef = useRef(false); // ✅ hard lock
  const citySearchCacheRef = useRef<Map<string, CityOption[]>>(new Map());

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const canSubmit =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.password.length >= 6 &&
    formData.confirmPassword.length >= 6 &&
    Boolean(selectedCity) &&
    agreeTerms &&
    Boolean(captchaToken) &&
    !isLoading;

  useEffect(() => {
    const searchTerm = citySearch.trim();

    if (selectedCity || searchTerm.length < 3) {
      setCityResults([]);
      setIsSearchingCities(false);
      return;
    }

    const cacheKey = searchTerm.toLowerCase();
    const cachedResults = citySearchCacheRef.current.get(cacheKey);
    if (cachedResults) {
      setCityResults(cachedResults);
      setIsSearchingCities(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearchingCities(true);
      try {
        const response = await fetch(
          `/api/cities?search=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        const cities = response.ok ? data.cities || [] : [];
        citySearchCacheRef.current.set(cacheKey, cities);
        setCityResults(cities);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.log("[signup] City search failed:", error);
        }
        setCityResults([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [citySearch, selectedCity]);

  const showToastBeforeRedirect = async (message: string, href: string) => {
    toast.success(message);
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push(href);
  };

  const isDuplicateEmailError = (message: string) => {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("already registered") ||
      normalized.includes("already exists") ||
      normalized.includes("already been registered") ||
      normalized.includes("user already registered")
    );
  };

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

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const { password, confirmPassword } = formData;

    // ✅ Validations
    if (!name) {
      toast.error("Full name is required");
      isSubmittingRef.current = false;
      return;
    }

    if (!email) {
      toast.error("Email is required");
      isSubmittingRef.current = false;
      return;
    }

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

    if (!selectedCity) {
      toast.error("Please select your city for letter delivery");
      isSubmittingRef.current = false;
      return;
    }

    if (!captchaToken) {
      toast.error("Please complete the captcha");
      isSubmittingRef.current = false;
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email;
      const emailCheckResponse = await fetch(
        `/api/auth/signup?email=${encodeURIComponent(normalizedEmail)}`,
      );
      const emailCheck = await emailCheckResponse.json().catch(() => null);

      if (!emailCheckResponse.ok) {
        throw new Error(
          typeof emailCheck?.error === "string"
            ? emailCheck.error
            : "Could not verify email availability",
        );
      }

      if (emailCheck?.exists) {
        toast.error("An account with this email already exists. Please sign in instead.");
        resetHCaptcha();
        setCaptchaToken("");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          captchaToken,
          data: {
            name,
            full_name: name,
            city_uuid_id: selectedCity.uuid_id,
          },
        },
      });

      if (error) {
        // 🎯 Handle rate limit nicely
        if (error.message.toLowerCase().includes("rate")) {
          toast.error("Too many attempts. Please wait and try again.");
        } else if (isDuplicateEmailError(error.message)) {
          toast.error("An account with this email already exists. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        resetHCaptcha();
        setCaptchaToken("");
        return;
      }

      // 📩 Email confirmation flow
      if (!data.session) {
        toast.success("Check your email to confirm your account");
        return;
      }

      // ✅ Direct login case
      await showToastBeforeRedirect("Account created successfully", "/app/profile");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      resetHCaptcha();
      setCaptchaToken("");
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
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-required="true"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-required="true"
                required
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-foreground">
              City for Letter Delivery <span className="text-destructive">*</span>
            </label>
            {selectedCity ? (
              <div className="flex items-center justify-between gap-3 rounded-sm border border-primary/40 bg-primary/10 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                  <p className="truncate font-serif font-bold text-foreground">
                    {selectedCity.city}, {selectedCity.country}
                  </p>
                  {selectedCity.admin_name && (
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedCity.admin_name}
                    </p>
                  )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity(null);
                    setCitySearch("");
                  }}
                  className="rounded-sm p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Remove selected city"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                  <input
                    id="city"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search city, e.g. Sahiwal"
                    className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-required="true"
                    required
                  />
                </div>
                {(cityResults.length > 0 || isSearchingCities) && (
                  <div className="max-h-60 overflow-y-auto rounded-sm border border-border bg-card shadow-xl">
                    {isSearchingCities ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Searching cities...
                      </div>
                    ) : (
                      cityResults.map((city) => (
                        <button
                          key={city.uuid_id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch(`${city.city}, ${city.country}`);
                            setCityResults([]);
                          }}
                          className="w-full px-4 py-3 text-left transition hover:bg-muted"
                        >
                          <p className="font-serif font-bold text-foreground">
                            {city.city}, {city.country}
                          </p>
                          {city.admin_name && (
                            <p className="text-xs text-muted-foreground">
                              {city.admin_name}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                minLength={6}
                aria-required="true"
                required
              />
            </div>
          </div>

          {/* Confirm */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Check className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-sm border border-border bg-input py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
                minLength={6}
                aria-required="true"
                required
              />
            </div>
          </div>

          {/* Terms */}
          <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
              required
            />
            <span>I agree to Terms & Privacy Policy <span className="text-destructive">*</span></span>
          </label>

          <p className="text-xs text-muted-foreground">
            Captcha is required <span className="text-destructive">*</span>
          </p>
          <HCaptchaChallenge
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken("")}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-3 font-serif font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
