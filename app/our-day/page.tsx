"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const moods = ["Happy", "Sad", "Confused", "Angry", "Neutral"];

const supabase = createClient();

export default function OurDayPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [mood, setMood] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [sleepTime, setSleepTime] = useState("");

  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");

  const [workMinutes, setWorkMinutes] = useState("0");
  const [collegeMinutes, setCollegeMinutes] = useState("0");
  const [socialMinutes, setSocialMinutes] = useState("0");

  const [workoutDone, setWorkoutDone] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");

  const [today, setToday] = useState("");

  useEffect(() => {
    const currentToday = new Date().toISOString().split("T")[0];

    setToday(currentToday);

    async function loadToday() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data } = await supabase
        .from("daily_tracker")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", currentToday)
        .maybeSingle();

      if (data) {
        setMood(data.mood ?? "");
        setWakeTime(data.wake_time ?? "");
        setSleepTime(data.sleep_time ?? "");
        setBreakfast(data.breakfast ?? "");
        setLunch(data.lunch ?? "");
        setDinner(data.dinner ?? "");
        setWorkMinutes(String(data.work_minutes ?? 0));
        setCollegeMinutes(String(data.college_minutes ?? 0));
        setSocialMinutes(String(data.social_media_minutes ?? 0));
        setWorkoutDone(data.workout_done ?? false);
        setWorkoutNotes(data.workout_notes ?? "");
      }

      setLoading(false);
    }

    loadToday();
  }, []);

  async function saveToday() {
    if (!userId || !today) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("daily_tracker").upsert(
      {
        user_id: userId,
        entry_date: today,
        mood: mood || null,
        wake_time: wakeTime || null,
        sleep_time: sleepTime || null,
        breakfast: breakfast || null,
        lunch: lunch || null,
        dinner: dinner || null,
        work_minutes: Number(workMinutes) || 0,
        college_minutes: Number(collegeMinutes) || 0,
        social_media_minutes: Number(socialMinutes) || 0,
        workout_done: workoutDone,
        workout_notes: workoutNotes || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,entry_date",
      }
    );

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Today's progress saved.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-8">
        <p className="text-sm text-[#777]">
          Loading today&apos;s tracker...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] px-5 py-8 pb-28 md:px-10 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm text-[#888]">Today · {today}</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#252525]">
            Our Day
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Keep track of the little things that make your day.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Mood
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {moods.map((item) => (
                <button
                  key={item}
                  onClick={() => setMood(item)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    mood === item
                      ? "border-[#252525] bg-[#252525] text-white"
                      : "border-black/10 text-[#666] hover:bg-[#f5f5f0]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Sleep
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="text-sm text-[#666]">
                Wake time

                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5 text-[#252525]"
                />
              </label>

              <label className="text-sm text-[#666]">
                Sleep time

                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5 text-[#252525]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Meals
            </h2>

            <div className="mt-4 space-y-3">
              <input
                value={breakfast}
                onChange={(e) => setBreakfast(e.target.value)}
                placeholder="Breakfast"
                className="w-full rounded-xl border border-black/10 px-3 py-2.5"
              />

              <input
                value={lunch}
                onChange={(e) => setLunch(e.target.value)}
                placeholder="Lunch"
                className="w-full rounded-xl border border-black/10 px-3 py-2.5"
              />

              <input
                value={dinner}
                onChange={(e) => setDinner(e.target.value)}
                placeholder="Dinner"
                className="w-full rounded-xl border border-black/10 px-3 py-2.5"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#252525]">
              Time
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block text-sm text-[#666]">
                Money-earning work (minutes)

                <input
                  type="number"
                  min="0"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5"
                />
              </label>

              <label className="block text-sm text-[#666]">
                College work (minutes)

                <input
                  type="number"
                  min="0"
                  value={collegeMinutes}
                  onChange={(e) => setCollegeMinutes(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5"
                />
              </label>

              <label className="block text-sm text-[#666]">
                Social media (minutes)

                <input
                  type="number"
                  min="0"
                  value={socialMinutes}
                  onChange={(e) => setSocialMinutes(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-[#252525]">
              Workout
            </h2>

            <label className="mt-4 flex items-center gap-3 text-sm text-[#555]">
              <input
                type="checkbox"
                checked={workoutDone}
                onChange={(e) => setWorkoutDone(e.target.checked)}
                className="h-4 w-4"
              />

              Workout completed today
            </label>

            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Workout notes..."
              rows={4}
              className="mt-4 w-full rounded-xl border border-black/10 px-3 py-2.5"
            />
          </section>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={saveToday}
            disabled={saving}
            className="rounded-xl bg-[#252525] px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save today&apos;s progress"}
          </button>

          {message && (
            <p className="text-sm text-[#666]">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}