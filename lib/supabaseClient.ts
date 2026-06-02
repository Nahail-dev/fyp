import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const REMEMBER_SESSION_KEY = "yuubin-remember-session";
let browserClient: SupabaseClient | null = null;

function getAuthStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;

  const rememberSession =
    window.localStorage.getItem(REMEMBER_SESSION_KEY) !== "false";

  return rememberSession ? window.localStorage : window.sessionStorage;
}

export function setRememberSession(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_SESSION_KEY, String(remember));
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: getAuthStorage(),
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  );

  return browserClient;
}

export function resetBrowserClient() {
  browserClient = null;
}
