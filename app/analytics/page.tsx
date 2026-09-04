"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Profile = {
  user_id: string;
  person: "akshaya" | "rishi";
};

type Tracker = {
  user_id: string;
  entry_date: string;
  mood: string | null;
  sleep_time: string | null;
  wake_time: string | null;
  work_minutes: number | null;
  college_minutes: number | null;
  social_media_minutes: number | null;
  workout_done: boolean | null;
};

type FinanceEntry = {
  entry_date: string;
  entry_type: "income" | "expense";
  amount: number;
};

function sleepMinutes(
  sleepTime: string | null,
  wakeTime: string | null,
) {
  if (!sleepTime || !wakeTime) {
    return null;
  }

  const [sleepHour, sleepMinute] = sleepTime
    .slice(0, 5)
    .split(":")
    .map(Number);

  const [wakeHour, wakeMinute] = wakeTime
    .slice(0, 5)
    .split(":")
    .map(Number);

  const sleep = sleepHour * 60 + sleepMinute;
  const wake = wakeHour * 60 + wakeMinute;

  let duration = wake - sleep;

  if (duration <= 0) {
    duration += 24 * 60;
  }

  return duration;
}

function formatDuration(minutes: number | null) {
  if (minutes === null) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) {
    return `${remaining}m`;
  }

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
}

function getLastSevenDates(today: string) {
  const dates: string[] = [];

  if (!today) {
    return dates;
  }

  const base = new Date(`${today}T00:00:00`);

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(base);
    date.setDate(base.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

export default function AnalyticsPage() {
  const [today, setToday] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [financeEntries, setFinanceEntries] = useState<
    FinanceEntry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
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

      const { data: profileData, error: profileError } =
        await supabase
          .from("akri_profiles")
          .select("user_id, person");

      if (profileError) {
        setMessage("Could not load AKRI profiles.");
        setLoading(false);
        return;
      }

      setProfiles(profileData ?? []);

      const { data: trackerData, error: trackerError } =
        await supabase
          .from("daily_tracker")
          .select(
            "user_id, entry_date, mood, sleep_time, wake_time, work_minutes, college_minutes, social_media_minutes, workout_done",
          )
          .order("entry_date", { ascending: true });

      if (trackerError) {
        setMessage("Could not load tracker data.");
        setLoading(false);
        return;
      }

      setTrackers(trackerData ?? []);

      const { data: financeData, error: financeError } =
        await supabase
          .from("finance_entries")
          .select("entry_date, entry_type, amount")
          .order("entry_date", { ascending: true });

      if (financeError) {
        setMessage("Could not load finance data.");
        setLoading(false);
        return;
      }

      setFinanceEntries(financeData ?? []);
      setLoading(false);
    }

    loadAnalytics();
  }, []);

  const akshayaProfile = profiles.find(
    (profile) => profile.person === "akshaya",
  );

  const rishiProfile = profiles.find(
    (profile) => profile.person === "rishi",
  );

  const akshayaTrackers = trackers.filter(
    (tracker) => tracker.user_id === akshayaProfile?.user_id,
  );

  const rishiTrackers = trackers.filter(
    (tracker) => tracker.user_id === rishiProfile?.user_id,
  );

  const lastSevenDates = getLastSevenDates(today);

  const sleepChartData = lastSevenDates.map((date) => {
    const akshayaEntry = akshayaTrackers.find(
      (entry) => entry.entry_date === date,
    );

    const rishiEntry = rishiTrackers.find(
      (entry) => entry.entry_date === date,
    );

    const akshayaSleep = sleepMinutes(
      akshayaEntry?.sleep_time ?? null,
      akshayaEntry?.wake_time ?? null,
    );

    const rishiSleep = sleepMinutes(
      rishiEntry?.sleep_time ?? null,
      rishiEntry?.wake_time ?? null,
    );

    return {
      date: date.slice(5),
      Akshaya:
        akshayaSleep === null
          ? null
          : Number((akshayaSleep / 60).toFixed(1)),
      Rishi:
        rishiSleep === null
          ? null
          : Number((rishiSleep / 60).toFixed(1)),
    };
  });

  const workChartData = lastSevenDates.map((date) => {
    const akshayaEntry = akshayaTrackers.find(
      (entry) => entry.entry_date === date,
    );

    const rishiEntry = rishiTrackers.find(
      (entry) => entry.entry_date === date,
    );

    return {
      date: date.slice(5),
      Akshaya: akshayaEntry?.work_minutes ?? 0,
      Rishi: rishiEntry?.work_minutes ?? 0,
    };
  });

  const collegeChartData = lastSevenDates.map((date) => {
    const akshayaEntry = akshayaTrackers.find(
      (entry) => entry.entry_date === date,
    );

    const rishiEntry = rishiTrackers.find(
      (entry) => entry.entry_date === date,
    );

    return {
      date: date.slice(5),
      Akshaya: akshayaEntry?.college_minutes ?? 0,
      Rishi: rishiEntry?.college_minutes ?? 0,
    };
  });

  const socialChartData = lastSevenDates.map((date) => {
    const akshayaEntry = akshayaTrackers.find(
      (entry) => entry.entry_date === date,
    );

    const rishiEntry = rishiTrackers.find(
      (entry) => entry.entry_date === date,
    );

    return {
      date: date.slice(5),
      Akshaya: akshayaEntry?.social_media_minutes ?? 0,
      Rishi: rishiEntry?.social_media_minutes ?? 0,
    };
  });

  const workoutChartData = lastSevenDates.map((date) => {
    const akshayaEntry = akshayaTrackers.find(
      (entry) => entry.entry_date === date,
    );

    const rishiEntry = rishiTrackers.find(
      (entry) => entry.entry_date === date,
    );

    return {
      date: date.slice(5),
      Akshaya: akshayaEntry?.workout_done ? 1 : 0,
      Rishi: rishiEntry?.workout_done ? 1 : 0,
    };
  });

  const expenseChartData = lastSevenDates.map((date) => {
    const total = financeEntries
      .filter(
        (entry) =>
          entry.entry_date === date &&
          entry.entry_type === "expense",
      )
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return {
      date: date.slice(5),
      Expenses: total,
    };
  });

  const weeklyTrackers = trackers.filter((entry) =>
    lastSevenDates.includes(entry.entry_date),
  );

  const sleepValues = weeklyTrackers
    .map((entry) =>
      sleepMinutes(entry.sleep_time, entry.wake_time),
    )
    .filter((value): value is number => value !== null);

  const averageSleepMinutes =
    sleepValues.length > 0
      ? Math.round(
          sleepValues.reduce((sum, value) => sum + value, 0) /
            sleepValues.length,
        )
      : null;

  const totalWorkMinutes = weeklyTrackers.reduce(
    (sum, entry) => sum + (entry.work_minutes ?? 0),
    0,
  );

  const totalCollegeMinutes = weeklyTrackers.reduce(
    (sum, entry) => sum + (entry.college_minutes ?? 0),
    0,
  );

  const totalSocialMinutes = weeklyTrackers.reduce(
    (sum, entry) => sum + (entry.social_media_minutes ?? 0),
    0,
  );

  const workoutCount = weeklyTrackers.filter(
    (entry) => entry.workout_done,
  ).length;

  const moodValues = weeklyTrackers
    .map((entry) => entry.mood)
    .filter(Boolean);

  const latestMood =
    moodValues.length > 0
      ? moodValues[moodValues.length - 1]
      : null;

  const currentMonth = today.slice(0, 7);

  const monthlyExpenses = financeEntries
    .filter(
      (entry) =>
        entry.entry_date.startsWith(currentMonth) &&
        entry.entry_type === "expense",
    )
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const monthlyIncome = financeEntries
    .filter(
      (entry) =>
        entry.entry_date.startsWith(currentMonth) &&
        entry.entry_type === "income",
    )
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#777]">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold">
              Analytics
            </h1>

            <p className="mt-3 text-sm text-[#777]">
              {message}
            </p>
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
          <p className="text-sm text-[#888]">
            AKRI · Insights
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Understand your habits, progress, and shared life over time.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Sleep
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {formatDuration(averageSleepMinutes)}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              Weekly average
            </p>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Money-earning work
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {formatDuration(totalWorkMinutes)}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              Total this week
            </p>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              College work
            </p>

            <p className="mt-4 text-3xl font-semibold">
              {formatDuration(totalCollegeMinutes)}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              Total this week
            </p>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Expenses
            </p>

            <p className="mt-4 text-3xl font-semibold">
              ₹{monthlyExpenses.toLocaleString("en-IN")}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              This month
            </p>
          </section>
        </div>

        {/* Sleep + Work */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Health
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Sleep trend
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepChartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    unit="h"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="Akshaya"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Rishi"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Productivity
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Money-earning work
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workChartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    unit="m"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="Akshaya"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Rishi"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* College + Social */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Education
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              College work
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collegeChartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    unit="m"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="Akshaya"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Rishi"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Digital habits
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Social media time
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={socialChartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    unit="m"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="Akshaya"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Rishi"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Workout + Expenses */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Health
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Workout consistency
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workoutChartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    tickFormatter={(value) =>
                      value === 1 ? "Done" : "No"
                    }
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      Number(value) === 1 ? "Done" : "Not done"
                    }
                  />

                  <Line
                    type="step"
                    dataKey="Akshaya"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />

                  <Line
                    type="step"
                    dataKey="Rishi"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Money
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Expense trend
            </h2>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseChartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="Expenses"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Mood + weekly summary */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm text-[#888]">
            Shared progress
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            This week at a glance
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Workout days
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {workoutCount}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Across both trackers
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Work time
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {formatDuration(totalWorkMinutes)}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Money-earning work
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                College
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {formatDuration(totalCollegeMinutes)}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                College work
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Social media
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {formatDuration(totalSocialMinutes)}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                This week
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Latest mood
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {latestMood || "—"}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Most recent record
              </p>
            </div>
          </div>
        </section>

        {/* Finance summary */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-sm text-[#888]">
            Finance
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            Monthly money overview
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Income
              </p>

              <p className="mt-2 text-2xl font-semibold">
                ₹{monthlyIncome.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Current month
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Expenses
              </p>

              <p className="mt-2 text-2xl font-semibold">
                ₹{monthlyExpenses.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Current month
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Balance
              </p>

              <p className="mt-2 text-2xl font-semibold">
                ₹{monthlyBalance.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Income minus expenses
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}