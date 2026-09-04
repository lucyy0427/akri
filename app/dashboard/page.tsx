"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Tracker = {
  user_id: string;
  mood: string | null;
  wake_time: string | null;
  sleep_time: string | null;
  work_minutes: number | null;
  college_minutes: number | null;
  social_media_minutes: number | null;
  workout_done: boolean | null;
};

type SharedDay = {
  shared_note: string | null;
  akshaya_task: string | null;
  rishi_task: string | null;
  akshaya_task_done: boolean | null;
  rishi_task_done: boolean | null;
};

export default function DashboardPage() {
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [akshaya, setAkshaya] = useState<Tracker | null>(null);
  const [rishi, setRishi] = useState<Tracker | null>(null);
  const [shared, setShared] = useState<SharedDay | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const currentDate = new Date().toISOString().split("T")[0];
      setToday(currentDate);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You are not logged in.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("akri_profiles")
        .select("person")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        setMessage("Could not verify your AKRI profile.");
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("akri_profiles")
        .select("user_id, person");

      if (profilesError) {
        setMessage("Could not load AKRI profiles.");
        setLoading(false);
        return;
      }

      const { data: trackers, error: trackerError } = await supabase
        .from("daily_tracker")
        .select(
          "user_id, mood, wake_time, sleep_time, work_minutes, college_minutes, social_media_minutes, workout_done",
        )
        .eq("entry_date", currentDate);

      if (trackerError) {
        setMessage("Could not load today's personal data.");
        setLoading(false);
        return;
      }

      const akshayaProfile = profiles?.find(
        (item) => item.person === "akshaya",
      );

      const rishiProfile = profiles?.find(
        (item) => item.person === "rishi",
      );

      const akshayaTracker = trackers?.find(
        (item) => item.user_id === akshayaProfile?.user_id,
      );

      const rishiTracker = trackers?.find(
        (item) => item.user_id === rishiProfile?.user_id,
      );

      setAkshaya(akshayaTracker ?? null);
      setRishi(rishiTracker ?? null);

      const { data: sharedDay, error: sharedError } = await supabase
        .from("our_day")
        .select(
          "shared_note, akshaya_task, rishi_task, akshaya_task_done, rishi_task_done",
        )
        .eq("entry_date", currentDate)
        .maybeSingle();

      if (sharedError) {
        setMessage("Could not load today's shared data.");
        setLoading(false);
        return;
      }

      setShared(sharedDay ?? null);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  function formatMinutes(minutes: number | null | undefined) {
    const value = minutes ?? 0;

    if (value < 60) {
      return `${value} min`;
    }

    const hours = Math.floor(value / 60);
    const remaining = value % 60;

    if (remaining === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remaining}m`;
  }

  function personProgress(person: Tracker | null) {
    if (!person) {
      return "No entry yet";
    }

    const completed = [
      Boolean(person.mood),
      Boolean(person.wake_time && person.sleep_time),
      Boolean(person.workout_done),
      (person.work_minutes ?? 0) > 0,
      (person.college_minutes ?? 0) > 0,
    ].filter(Boolean).length;

    return `${completed}/5 tracked`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#777]">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-[#252525]">
              Dashboard
            </h1>
            <p className="mt-3 text-sm text-[#777]">{message}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] p-5 pb-24 text-[#252525] md:p-10 md:pb-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-[#888]">AKRI</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#252525]">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Your shared life and work overview.
          </p>

          {today && (
            <p className="mt-3 text-xs text-[#999]">
              {today}
            </p>
          )}
        </div>

        {/* Shared overview */}
        <section className="mb-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                Together
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
                Our Day
              </h2>

              <p className="mt-2 text-sm text-[#777]">
                {shared?.shared_note ||
                  "Nothing added to your shared day yet."}
              </p>
            </div>

            <Link
              href="/our-day"
              className="w-fit rounded-xl bg-[#252525] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#111]"
            >
              Open Our Day
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[#f5f5f0] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#555]">
                  Akshaya&apos;s task
                </p>

                <span className="text-xs text-[#888]">
                  {shared?.akshaya_task_done
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#777]">
                {shared?.akshaya_task || "No task assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#555]">
                  Rishi&apos;s task
                </p>

                <span className="text-xs text-[#888]">
                  {shared?.rishi_task_done
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#777]">
                {shared?.rishi_task || "No task assigned"}
              </p>
            </div>
          </div>
        </section>

        {/* Personal cards */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* Akshaya */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Personal
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
                  Akshaya
                </h2>
              </div>

              <Link
                href="/akshaya"
                className="text-sm text-[#777] underline-offset-4 hover:text-[#252525] hover:underline"
              >
                Open
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">Mood</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {akshaya?.mood || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">Progress</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {personProgress(akshaya)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">Work</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {formatMinutes(akshaya?.work_minutes)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">College</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {formatMinutes(akshaya?.college_minutes)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4">
              <div>
                <p className="text-xs text-[#999]">Workout</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {akshaya?.workout_done
                    ? "Completed"
                    : "Not completed"}
                </p>
              </div>

              <p className="text-xs text-[#999]">
                Sleep: {akshaya?.sleep_time || "—"}
              </p>
            </div>
          </section>

          {/* Rishi */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Personal
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
                  Rishi
                </h2>
              </div>

              <Link
                href="/rishi"
                className="text-sm text-[#777] underline-offset-4 hover:text-[#252525] hover:underline"
              >
                Open
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">Mood</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {rishi?.mood || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">Progress</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {personProgress(rishi)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">Work</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {formatMinutes(rishi?.work_minutes)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#999]">College</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {formatMinutes(rishi?.college_minutes)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4">
              <div>
                <p className="text-xs text-[#999]">Workout</p>
                <p className="mt-1 text-sm font-medium text-[#555]">
                  {rishi?.workout_done
                    ? "Completed"
                    : "Not completed"}
                </p>
              </div>

              <p className="text-xs text-[#999]">
                Sleep: {rishi?.sleep_time || "—"}
              </p>
            </div>
          </section>
        </div>

        {/* Quick links */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
            Quick access
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/our-day"
              className="rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm text-[#555] transition hover:bg-[#eeeeea]"
            >
              Our Day
            </Link>

            <Link
              href="/akshaya"
              className="rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm text-[#555] transition hover:bg-[#eeeeea]"
            >
              Akshaya
            </Link>

            <Link
              href="/rishi"
              className="rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm text-[#555] transition hover:bg-[#eeeeea]"
            >
              Rishi
            </Link>

            <Link
              href="/sleep"
              className="rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm text-[#555] transition hover:bg-[#eeeeea]"
            >
              Sleep
            </Link>

            <Link
              href="/finance"
              className="rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm text-[#555] transition hover:bg-[#eeeeea]"
            >
              Finance
            </Link>

            <Link
              href="/analytics"
              className="rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm text-[#555] transition hover:bg-[#eeeeea]"
            >
              Analytics
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}