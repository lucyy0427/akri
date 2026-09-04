"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const moods = ["Happy", "Sad", "Confused", "Angry", "Neutral"];

type TrackerData = {
  mood: string;
  wake_time: string;
  sleep_time: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  work_minutes: string;
  college_minutes: string;
  social_media_minutes: string;
  workout_done: boolean;
  workout_notes: string;
};

const emptyData: TrackerData = {
  mood: "",
  wake_time: "",
  sleep_time: "",
  breakfast: "",
  lunch: "",
  dinner: "",
  work_minutes: "0",
  college_minutes: "0",
  social_media_minutes: "0",
  workout_done: false,
  workout_notes: "",
};

export default function RishiPage() {
  const [today, setToday] = useState("");
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<TrackerData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    async function loadData() {
      const currentDate = new Date().toISOString().split("T")[0];
      setToday(currentDate);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfileError("You are not logged in.");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileLoadError } = await supabase
        .from("akri_profiles")
        .select("person")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileLoadError) {
        setProfileError("Could not verify your AKRI profile.");
        setLoading(false);
        return;
      }

      if (!profile || profile.person !== "rishi") {
        setProfileError(
          "This account is not connected to the Rishi profile.",
        );
        setLoading(false);
        return;
      }

      const { data: tracker, error: trackerError } = await supabase
        .from("daily_tracker")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", currentDate)
        .maybeSingle();

      if (trackerError) {
        setMessage("Could not load today's tracker.");
        setLoading(false);
        return;
      }

      if (tracker) {
        setData({
          mood: tracker.mood ?? "",
          wake_time: tracker.wake_time ?? "",
          sleep_time: tracker.sleep_time ?? "",
          breakfast: tracker.breakfast ?? "",
          lunch: tracker.lunch ?? "",
          dinner: tracker.dinner ?? "",
          work_minutes: String(tracker.work_minutes ?? 0),
          college_minutes: String(tracker.college_minutes ?? 0),
          social_media_minutes: String(
            tracker.social_media_minutes ?? 0,
          ),
          workout_done: tracker.workout_done ?? false,
          workout_notes: tracker.workout_notes ?? "",
        });
      }

      setLoading(false);
    }

    loadData();
  }, []);

  function updateField<K extends keyof TrackerData>(
    field: K,
    value: TrackerData[K],
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveToday() {
    if (!userId || !today) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("daily_tracker").upsert(
      {
        user_id: userId,
        entry_date: today,
        mood: data.mood || null,
        wake_time: data.wake_time || null,
        sleep_time: data.sleep_time || null,
        breakfast: data.breakfast || null,
        lunch: data.lunch || null,
        dinner: data.dinner || null,
        work_minutes: Number(data.work_minutes) || 0,
        college_minutes: Number(data.college_minutes) || 0,
        social_media_minutes:
          Number(data.social_media_minutes) || 0,
        workout_done: data.workout_done,
        workout_notes: data.workout_notes || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,entry_date",
      },
    );

    if (error) {
      setMessage(`Could not save: ${error.message}`);
    } else {
      setMessage("Today's progress saved.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-[#777]">
            Loading Rishi&apos;s day...
          </p>
        </div>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-[#252525]">
              Rishi
            </h1>

            <p className="mt-3 text-sm text-[#777]">
              {profileError}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] p-5 pb-24 text-[#252525] md:p-10 md:pb-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-[#888]">
            Personal tracker
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#252525]">
            Rishi&apos;s Day
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Your personal space for today.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* Mood */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Mood
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              How are you feeling today?
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => updateField("mood", mood)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    data.mood === mood
                      ? "bg-[#252525] text-white"
                      : "bg-[#f5f5f0] text-[#666] hover:bg-[#eeeeea]"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </section>

          {/* Sleep */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Sleep
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              Track your sleep and wake times.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="text-sm text-[#666]">
                Wake

                <input
                  type="time"
                  value={data.wake_time}
                  onChange={(e) =>
                    updateField("wake_time", e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                />
              </label>

              <label className="text-sm text-[#666]">
                Sleep

                <input
                  type="time"
                  value={data.sleep_time}
                  onChange={(e) =>
                    updateField("sleep_time", e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                />
              </label>
            </div>
          </section>

          {/* Meals */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Meals
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              Keep a simple record of what you ate.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="text"
                placeholder="Breakfast"
                value={data.breakfast}
                onChange={(e) =>
                  updateField("breakfast", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
              />

              <input
                type="text"
                placeholder="Lunch"
                value={data.lunch}
                onChange={(e) =>
                  updateField("lunch", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
              />

              <input
                type="text"
                placeholder="Dinner"
                value={data.dinner}
                onChange={(e) =>
                  updateField("dinner", e.target.value)
                }
                className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
              />
            </div>
          </section>

          {/* Time */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Time
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              Track the important parts of your day.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block text-sm text-[#666]">
                Money-earning work

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={data.work_minutes}
                    onChange={(e) =>
                      updateField(
                        "work_minutes",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                  />

                  <span className="text-xs text-[#999]">
                    min
                  </span>
                </div>
              </label>

              <label className="block text-sm text-[#666]">
                College work

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={data.college_minutes}
                    onChange={(e) =>
                      updateField(
                        "college_minutes",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                  />

                  <span className="text-xs text-[#999]">
                    min
                  </span>
                </div>
              </label>

              <label className="block text-sm text-[#666]">
                Social media

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={data.social_media_minutes}
                    onChange={(e) =>
                      updateField(
                        "social_media_minutes",
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                  />

                  <span className="text-xs text-[#999]">
                    min
                  </span>
                </div>
              </label>
            </div>
          </section>

          {/* Workout */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-[#252525]">
              Workout
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              Track whether you worked out and add a note.
            </p>

            <label className="mt-5 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.workout_done}
                onChange={(e) =>
                  updateField(
                    "workout_done",
                    e.target.checked,
                  )
                }
                className="h-5 w-5 rounded border-black/20"
              />

              <span className="text-sm text-[#555]">
                I worked out today
              </span>
            </label>

            <textarea
              placeholder="Workout notes..."
              value={data.workout_notes}
              onChange={(e) =>
                updateField(
                  "workout_notes",
                  e.target.value,
                )
              }
              rows={4}
              className="mt-4 w-full resize-none rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-3 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
            />
          </section>
        </div>

        {/* Save */}
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={saveToday}
            disabled={saving}
            className="rounded-xl bg-[#252525] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save today"}
          </button>

          {message && (
            <p className="text-sm text-[#777]">
              {message}
            </p>
          )}
        </div>

      </div>
    </main>
  );
}