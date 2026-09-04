"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Profile = {
  user_id: string;
  person: "akshaya" | "rishi";
};

type SleepEntry = {
  user_id: string;
  entry_date: string;
  sleep_time: string | null;
  wake_time: string | null;
};

function calculateSleepDuration(
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

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return `${hours}h ${minutes}m`;
}

function averageSleep(entries: SleepEntry[]) {
  const durations = entries
    .map((entry) => {
      if (!entry.sleep_time || !entry.wake_time) {
        return null;
      }

      const [sleepHour, sleepMinute] = entry.sleep_time
        .slice(0, 5)
        .split(":")
        .map(Number);

      const [wakeHour, wakeMinute] = entry.wake_time
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
    })
    .filter((value): value is number => value !== null);

  if (durations.length === 0) {
    return null;
  }

  const average =
    durations.reduce((sum, value) => sum + value, 0) /
    durations.length;

  const hours = Math.floor(average / 60);
  const minutes = Math.round(average % 60);

  return `${hours}h ${minutes}m`;
}

function formatTime(time: string | null) {
  if (!time) {
    return "—";
  }

  const [hourString, minute] = time.slice(0, 5).split(":");
  let hour = Number(hourString);

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
}

export default function SleepPage() {
  const [today, setToday] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSleep() {
      const currentDate = new Date().toISOString().split("T")[0];
      setToday(currentDate);

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

      const { data: sleepData, error: sleepError } =
        await supabase
          .from("daily_tracker")
          .select("user_id, entry_date, sleep_time, wake_time")
          .order("entry_date", { ascending: false });

      if (sleepError) {
        setMessage("Could not load sleep data.");
        setLoading(false);
        return;
      }

      setEntries(sleepData ?? []);
      setLoading(false);
    }

    loadSleep();
  }, []);

  const akshayaProfile = profiles.find(
    (profile) => profile.person === "akshaya",
  );

  const rishiProfile = profiles.find(
    (profile) => profile.person === "rishi",
  );

  const akshayaEntries = entries.filter(
    (entry) => entry.user_id === akshayaProfile?.user_id,
  );

  const rishiEntries = entries.filter(
    (entry) => entry.user_id === rishiProfile?.user_id,
  );

  const akshayaToday =
    akshayaEntries.find((entry) => entry.entry_date === today) ??
    null;

  const rishiToday =
    rishiEntries.find((entry) => entry.entry_date === today) ??
    null;

  const akshayaWeekly = akshayaEntries.filter((entry) => {
    if (!today) return false;

    const todayDate = new Date(`${today}T00:00:00`);
    const entryDate = new Date(`${entry.entry_date}T00:00:00`);

    const difference =
      (todayDate.getTime() - entryDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return difference >= 0 && difference < 7;
  });

  const rishiWeekly = rishiEntries.filter((entry) => {
    if (!today) return false;

    const todayDate = new Date(`${today}T00:00:00`);
    const entryDate = new Date(`${entry.entry_date}T00:00:00`);

    const difference =
      (todayDate.getTime() - entryDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return difference >= 0 && difference < 7;
  });

  const akshayaAverage = averageSleep(akshayaWeekly);
  const rishiAverage = averageSleep(rishiWeekly);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#777]">
            Loading sleep data...
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
              Sleep
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
            AKRI · Health
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#252525]">
            Sleep
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Track sleep, wake times, and your progress over time.
          </p>
        </div>

        {/* Today's sleep */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* Akshaya */}
          <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-sm text-[#888]">
              Akshaya
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
              Sleep tracking
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5f5f0] p-5">
                <p className="text-sm text-[#888]">
                  Sleep
                </p>

                <p className="mt-2 text-xl font-medium text-[#252525]">
                  {formatTime(
                    akshayaToday?.sleep_time ?? null,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-5">
                <p className="text-sm text-[#888]">
                  Wake
                </p>

                <p className="mt-2 text-xl font-medium text-[#252525]">
                  {formatTime(
                    akshayaToday?.wake_time ?? null,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Today&apos;s duration
              </p>

              <p className="mt-2 text-xl font-medium text-[#252525]">
                {calculateSleepDuration(
                  akshayaToday?.sleep_time ?? null,
                  akshayaToday?.wake_time ?? null,
                ) ?? "No sleep data"}
              </p>
            </div>
          </section>

          {/* Rishi */}
          <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-sm text-[#888]">
              Rishi
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
              Sleep tracking
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5f5f0] p-5">
                <p className="text-sm text-[#888]">
                  Sleep
                </p>

                <p className="mt-2 text-xl font-medium text-[#252525]">
                  {formatTime(
                    rishiToday?.sleep_time ?? null,
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-5">
                <p className="text-sm text-[#888]">
                  Wake
                </p>

                <p className="mt-2 text-xl font-medium text-[#252525]">
                  {formatTime(
                    rishiToday?.wake_time ?? null,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Today&apos;s duration
              </p>

              <p className="mt-2 text-xl font-medium text-[#252525]">
                {calculateSleepDuration(
                  rishiToday?.sleep_time ?? null,
                  rishiToday?.wake_time ?? null,
                ) ?? "No sleep data"}
              </p>
            </div>
          </section>
        </div>

        {/* Weekly overview */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
          <div>
            <p className="text-sm text-[#888]">
              Weekly overview
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
              Average sleep
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Akshaya
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#252525]">
                {akshayaAverage ?? "No data"}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Based on the last 7 days
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5">
              <p className="text-sm text-[#888]">
                Rishi
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#252525]">
                {rishiAverage ?? "No data"}
              </p>

              <p className="mt-1 text-xs text-[#999]">
                Based on the last 7 days
              </p>
            </div>
          </div>
        </section>

        {/* Recent sleep records */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
          <p className="text-sm text-[#888]">
            Recent records
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
            Sleep history
          </h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-[#999]">
                  <th className="pb-3 font-medium">
                    Date
                  </th>

                  <th className="pb-3 font-medium">
                    Person
                  </th>

                  <th className="pb-3 font-medium">
                    Sleep
                  </th>

                  <th className="pb-3 font-medium">
                    Wake
                  </th>

                  <th className="pb-3 font-medium">
                    Duration
                  </th>
                </tr>
              </thead>

              <tbody>
                {entries.slice(0, 14).map((entry) => {
                  const person =
                    entry.user_id === akshayaProfile?.user_id
                      ? "Akshaya"
                      : entry.user_id === rishiProfile?.user_id
                        ? "Rishi"
                        : "Unknown";

                  return (
                    <tr
                      key={`${entry.user_id}-${entry.entry_date}`}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-4 text-[#555]">
                        {entry.entry_date}
                      </td>

                      <td className="py-4 font-medium text-[#555]">
                        {person}
                      </td>

                      <td className="py-4 text-[#777]">
                        {formatTime(entry.sleep_time)}
                      </td>

                      <td className="py-4 text-[#777]">
                        {formatTime(entry.wake_time)}
                      </td>

                      <td className="py-4 text-[#777]">
                        {calculateSleepDuration(
                          entry.sleep_time,
                          entry.wake_time,
                        ) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {entries.length === 0 && (
              <div className="rounded-2xl bg-[#f5f5f0] p-8 text-center">
                <p className="text-sm text-[#777]">
                  No sleep records yet.
                </p>

                <p className="mt-1 text-xs text-[#999]">
                  Add sleep and wake times from the personal trackers.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}