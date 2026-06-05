"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
}

export default function TestDatabasePage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateResult = (
    name: string,
    status: "pending" | "success" | "error",
    message: string,
  ) => {
    setResults((prev) => {
      const existing = prev.findIndex((r) => r.name === name);
      const newResult = { name, status, message };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: Get current user
      updateResult("Get Current User", "pending", "Checking authentication...");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        updateResult(
          "Get Current User",
          "error",
          "No authenticated user found",
        );
        toast.error("You must be logged in to run tests");
        setLoading(false);
        return;
      }
      updateResult(
        "Get Current User",
        "success",
        `Logged in as: ${user.email}`,
      );
      console.log("[v0] Current user:", user);

      // Test 2: Fetch user profile
      updateResult("Fetch User Profile", "pending", "Fetching profile data...");
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        updateResult(
          "Fetch User Profile",
          "error",
          `Error: ${profileError.message}`,
        );
      } else if (!profile) {
        updateResult(
          "Fetch User Profile",
          "error",
          "No profile row (or RLS blocked read)",
        );
      } else {
        updateResult(
          "Fetch User Profile",
          "success",
          `Profile loaded: ${profile.full_name}`,
        );
        console.log("[v0] User profile:", profile);
      }

      // Test 3: Update profile
      updateResult(
        "Update Profile Data",
        "pending",
        "Testing profile update...",
      );
      const testBio = `Testing at ${new Date().toLocaleString()}`;
      const { data: updatedProfile, error: updateError } = await supabase
        .from("users")
        .update({
          bio: testBio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .maybeSingle();

      if (updateError) {
        updateResult(
          "Update Profile Data",
          "error",
          `Error: ${updateError.message}`,
        );
      } else if (!updatedProfile) {
        updateResult(
          "Update Profile Data",
          "error",
          "Update returned no row (check RLS allows SELECT after UPDATE)",
        );
      } else {
        updateResult(
          "Update Profile Data",
          "success",
          "Profile updated successfully",
        );
        console.log("[v0] Updated profile:", updatedProfile);
      }

      // Test 4: Fetch letters received
      updateResult(
        "Fetch Received Letters",
        "pending",
        "Fetching inbox letters...",
      );
      const { data: lettersReceived, error: lettersError } = await supabase
        .from("letters")
        .select("id, title, status, created_at")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (lettersError) {
        updateResult(
          "Fetch Received Letters",
          "error",
          `Error: ${lettersError.message}`,
        );
      } else {
        updateResult(
          "Fetch Received Letters",
          "success",
          `Found ${lettersReceived?.length || 0} received letters`,
        );
        console.log("[v0] Received letters:", lettersReceived);
      }

      // Test 5: Fetch letters sent
      updateResult("Fetch Sent Letters", "pending", "Fetching sent letters...");
      const { data: lettersSent, error: sentError } = await supabase
        .from("letters")
        .select("id, title, status, created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (sentError) {
        updateResult(
          "Fetch Sent Letters",
          "error",
          `Error: ${sentError.message}`,
        );
      } else {
        updateResult(
          "Fetch Sent Letters",
          "success",
          `Found ${lettersSent?.length || 0} sent letters`,
        );
        console.log("[v0] Sent letters:", lettersSent);
      }

      // Test 6: Fetch user's stamps
      updateResult(
        "Fetch User Stamps",
        "pending",
        "Fetching stamp collection...",
      );
      const { data: stamps, error: stampsError } = await supabase
        .from("stamps")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (stampsError) {
        updateResult(
          "Fetch User Stamps",
          "error",
          `Error: ${stampsError.message}`,
        );
      } else {
        updateResult(
          "Fetch User Stamps",
          "success",
          `Found ${stamps?.length || 0} stamps collected`,
        );
        console.log("[v0] User stamps:", stamps);
      }

      // Test 7: Count statistics
      updateResult(
        "Calculate Stats",
        "pending",
        "Calculating user statistics...",
      );
      try {
        // Count received letters
        const { count: receivedCount, error: recError } = await supabase
          .from("letters")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", user.id);

        // Count sent letters
        const { count: sentCount, error: sentCountError } = await supabase
          .from("letters")
          .select("id", { count: "exact", head: true })
          .eq("sender_id", user.id);

        // Count stamps
        const { count: stampCount, error: stampCountError } = await supabase
          .from("stamps")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (recError || sentCountError || stampCountError) {
          updateResult(
            "Calculate Stats",
            "error",
            "Error calculating some statistics",
          );
        } else {
          const statsMessage = `Received: ${receivedCount || 0}, Sent: ${sentCount || 0}, Stamps: ${stampCount || 0}`;
          updateResult("Calculate Stats", "success", statsMessage);
          console.log("[v0] Stats:", {
            received: receivedCount,
            sent: sentCount,
            stamps: stampCount,
          });
        }
      } catch (e) {
        updateResult("Calculate Stats", "error", "Failed to calculate stats");
      }

      // Test 8: Fetch all profiles (for explore page)
      updateResult(
        "Fetch All User Profiles",
        "pending",
        "Fetching all user profiles...",
      );
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("users")
        .select("id, full_name, bio, interests")
        .order("created_at", { ascending: false })
        .limit(10);

      if (allProfilesError) {
        updateResult(
          "Fetch All User Profiles",
          "error",
          `Error: ${allProfilesError.message}`,
        );
      } else {
        updateResult(
          "Fetch All User Profiles",
          "success",
          `Found ${allProfiles?.length || 0} user profiles`,
        );
        console.log("[v0] All profiles:", allProfiles);
      }

      toast.success("All tests completed! Check console for details.");
    } catch (error) {
      console.log("[v0] Test error:", error);
      toast.error("Test failed - check console for details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Database Tests
        </h1>
        <p className="text-muted-foreground">
          Verify that all database operations are working correctly
        </p>
      </div>

      {/* Run Tests Button */}
      <button
        onClick={runTests}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-sm hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>Run Database Tests</>
        )}
      </button>

      {/* Results */}
      <div className="space-y-3">
        {results.length === 0 && !loading && (
          <div className="postal-card p-6 text-center text-muted-foreground">
            <p>Click the button above to run database tests</p>
          </div>
        )}

        {results.map((result) => (
          <div
            key={result.name}
            className="postal-card p-4 flex items-start gap-4"
          >
            <div className="flex-shrink-0 pt-1">
              {result.status === "pending" && (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              )}
              {result.status === "success" && (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              )}
              {result.status === "error" && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{result.name}</h3>
              <p
                className={`text-sm ${
                  result.status === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {result.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Console Info */}
      {results.length > 0 && (
        <div className="postal-card p-6 bg-muted/30 space-y-2">
          <p className="text-sm font-medium text-foreground">Console Output</p>
          <p className="text-xs text-muted-foreground">
            Open your browser&apos;s developer console (F12) to see detailed
            logs of all database operations. Look for messages starting with
            &quot;[v0]&quot;
          </p>
        </div>
      )}
    </div>
  );
}
