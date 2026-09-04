"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
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
  user_id: string;
  entry_date: string;
  entry_type: "income" | "expense";
  amount: number;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLastSevenDates(today: string) {
  if (!today) {
    return [];
  }

  const dates: string[] = [];
  const base = new Date(`${today}T00:00:00`);

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(base);
    date.setDate(base.getDate() - i);
    dates.push(getLocalDateString(date));
  }

  return dates;
}

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

function formatChartDate(date: string) {
  return date.slice(5);
}

export default function AnalyticsPage() {
  const [today, setToday] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setMessage("");

      const currentDate = getLocalDateString();
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
        console.error(profileError);
        setMessage("Could not load AKRI profiles.");
        setLoading(false);
        return;
      }

      const loadedProfiles = (profileData ?? []) as Profile[];

      setProfiles(loadedProfiles);

      const { data: trackerData, error: trackerError } =
        await supabase
          .from("daily_tracker")
          .select(
            "user_id, entry_date, mood, sleep_time, wake_time, work_minutes, college_minutes, social_media_minutes, workout_done",
          )
          .order("entry_date", { ascending: true });

      if (trackerError) {
        console.error(trackerError);
        setMessage("Could not load tracker data.");
        setLoading(false);
        return;
      }

      setTrackers((trackerData ?? []) as Tracker[]);

      const { data: financeData, error: financeError } =
        await supabase
          .from("finance_entries")
          .select("user_id, entry_date, entry_type, amount")
          .order("entry_date", { ascending: true });

      if (financeError) {
        console.error(financeError);
        setMessage("Could not load finance data.");
        setLoading(false);
        return;
      }

      setFinanceEntries((financeData ?? []) as FinanceEntry[]);
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

  const akshayaTrackers = useMemo(
    () =>
      trackers.filter(
        (tracker) => tracker.user_id === akshayaProfile?.user_id,
      ),
    [trackers, akshayaProfile?.user_id],
  );

  const rishiTrackers = useMemo(
    () =>
      trackers.filter(
        (tracker) => tracker.user_id === rishiProfile?.user_id,
      ),
    [trackers, rishiProfile?.user_id],
  );

  const lastSevenDates = useMemo(
    () => getLastSevenDates(today),
    [today],
  );

  function findTracker(
    trackerList: Tracker[],
    date: string,
  ) {
    return trackerList.find(
      (entry) => entry.entry_date.slice(0, 10) === date,
    );
  }

  const sleepChartData = lastSevenDates.map((date) => {
    const akshayaEntry = findTracker(akshayaTrackers, date);
    const rishiEntry = findTracker(rishiTrackers, date);

    const akshayaSleep = sleepMinutes(
      akshayaEntry?.sleep_time ?? null,
      akshayaEntry?.wake_time ?? null,
    );

    const rishiSleep = sleepMinutes(
      rishiEntry?.sleep_time ?? null,
      rishiEntry?.wake_time ?? null,
    );

    return {
      date: formatChartDate(date),
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
    const akshayaEntry = findTracker(akshayaTrackers, date);
    const rishiEntry = findTracker(rishiTrackers, date);

    return {
      date: formatChartDate(date),
      Akshaya: Number(akshayaEntry?.work_minutes ?? 0),
      Rishi: Number(rishiEntry?.work_minutes ?? 0),
    };
  });

  const collegeChartData = lastSevenDates.map((date) => {
    const akshayaEntry = findTracker(akshayaTrackers, date);
    const rishiEntry = findTracker(rishiTrackers, date);

    return {
      date: formatChartDate(date),
      Akshaya: Number(akshayaEntry?.college_minutes ?? 0),
      Rishi: Number(rishiEntry?.college_minutes ?? 0),
    };
  });

  const socialChartData = lastSevenDates.map((date) => {
    const akshayaEntry = findTracker(akshayaTrackers, date);
    const rishiEntry = findTracker(rishiTrackers, date);

    return {
      date: formatChartDate(date),
      Akshaya: Number(
        akshayaEntry?.social_media_minutes ?? 0,
      ),
      Rishi: Number(
        rishiEntry?.social_media_minutes ?? 0,
      ),
    };
  });

  const workoutChartData = lastSevenDates.map((date) => {
    const akshayaEntry = findTracker(akshayaTrackers, date);
    const rishiEntry = findTracker(rishiTrackers, date);

    return {
      date: formatChartDate(date),
      Akshaya: akshayaEntry?.workout_done ? 1 : 0,
      Rishi: rishiEntry?.workout_done ? 1 : 0,
    };
  });

  const expenseChartData = lastSevenDates.map((date) => {
    const total = financeEntries
      .filter(
        (entry) =>
          entry.entry_date.slice(0, 10) === date &&
          entry.entry_type === "expense",
      )
      .reduce(
        (sum, entry) => sum + Number(entry.amount),
        0,
      );

    return {
      date: formatChartDate(date),
      Expenses: total,
    };
  });

  const weeklyTrackers = trackers.filter((entry) =>
    lastSevenDates.includes(entry.entry_date.slice(0, 10)),
  );

  const sleepValues = weeklyTrackers
    .map((entry) =>
      sleepMinutes(entry.sleep_time, entry.wake_time),
    )
    .filter((value): value is number => value !== null);

  const averageSleepMinutes =
    sleepValues.length > 0
      ? Math.round(
          sleepValues.reduce(
            (sum, value) => sum + value,
            0,
          ) / sleepValues.length,
        )
      : null;

  const totalWorkMinutes = weeklyTrackers.reduce(
    (sum, entry) =>
      sum + Number(entry.work_minutes ?? 0),
    0,
  );

  const totalCollegeMinutes = weeklyTrackers.reduce(
    (sum, entry) =>
      sum + Number(entry.college_minutes ?? 0),
    0,
  );

  const totalSocialMinutes = weeklyTrackers.reduce(
    (sum, entry) =>
      sum + Number(entry.social_media_minutes ?? 0),
    0,
  );

  const workoutCount = weeklyTrackers.filter(
    (entry) => entry.workout_done,
  ).length;

  const latestMoodEntry = [...weeklyTrackers]
    .filter((entry) => entry.mood)
    .sort((a, b) =>
      a.entry_date.localeCompare(b.entry_date),
    )
    .at(-1);

  const latestMood = latestMoodEntry?.mood ?? null;

  const currentMonth = today.slice(0, 7);

  const monthlyExpenses = financeEntries
    .filter(
      (entry) =>
        entry.entry_date.slice(0, 7) === currentMonth &&
        entry.entry_type === "expense",
    )
    .reduce(
      (sum, entry) => sum + Number(entry.amount),
      0,
    );

  const monthlyIncome = financeEntries
    .filter(
      (entry) =>
        entry.entry_date.slice(0, 7) === currentMonth &&
        entry.entry_type === "income",
    )
    .reduce(
      (sum, entry) => sum + Number(entry.amount),
      0,
    );

  const monthlyBalance =
    monthlyIncome - monthlyExpenses;

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
            Your shared habits, progress, and money over the last 7 days.
          </p>

          <p className="mt-2 text-xs text-[#aaa]">
            Showing {lastSevenDates[0]} → {today}
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
              Average across both
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
              Combined this week
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
              Combined this week
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
                      Number(value) === 1
                        ? "Done"
                        : "Not done"
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
                      `₹${Number(value).toLocaleString(
                        "en-IN",
                      )}`
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

        {/* Weekly Summary */}
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

        {/* Finance */}
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