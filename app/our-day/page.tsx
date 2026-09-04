"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type OurDayData = {
  shared_note: string;
  akshaya_task: string;
  rishi_task: string;
  akshaya_task_done: boolean;
  rishi_task_done: boolean;
};

const emptyData: OurDayData = {
  shared_note: "",
  akshaya_task: "",
  rishi_task: "",
  akshaya_task_done: false,
  rishi_task_done: false,
};

export default function OurDayPage() {
  const [today, setToday] = useState("");
  const [data, setData] = useState<OurDayData>(emptyData);
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

      const { data: profile, error: profileError } = await supabase
        .from("akri_profiles")
        .select("person")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        setProfileError("Could not verify your AKRI profile.");
        setLoading(false);
        return;
      }

      if (!profile) {
        setProfileError("This account is not connected to AKRI.");
        setLoading(false);
        return;
      }

      const { data: sharedDay, error: sharedDayError } = await supabase
        .from("our_day")
        .select("*")
        .eq("entry_date", currentDate)
        .maybeSingle();

      if (sharedDayError) {
        setMessage("Could not load today's shared day.");
        setLoading(false);
        return;
      }

      if (sharedDay) {
        setData({
          shared_note: sharedDay.shared_note ?? "",
          akshaya_task: sharedDay.akshaya_task ?? "",
          rishi_task: sharedDay.rishi_task ?? "",
          akshaya_task_done: sharedDay.akshaya_task_done ?? false,
          rishi_task_done: sharedDay.rishi_task_done ?? false,
        });
      }

      setLoading(false);
    }

    loadData();
  }, []);

  function updateField<K extends keyof OurDayData>(
    field: K,
    value: OurDayData[K],
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveToday() {
    if (!today) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("our_day").upsert(
      {
        entry_date: today,
        shared_note: data.shared_note || null,
        akshaya_task: data.akshaya_task || null,
        rishi_task: data.rishi_task || null,
        akshaya_task_done: data.akshaya_task_done,
        rishi_task_done: data.rishi_task_done,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "entry_date",
      },
    );

    if (error) {
      setMessage(`Could not save: ${error.message}`);
    } else {
      setMessage("Today's shared day saved.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-[#777]">
            Loading your shared day...
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
              Our Day
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
            Shared space
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#252525]">
            Our Day
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Plan the day together and keep track of what matters.
          </p>

          {today && (
            <p className="mt-3 text-xs text-[#999]">
              {today}
            </p>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          {/* Shared Note */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-[#252525]">
              Shared note
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              Anything you both want to remember today.
            </p>

            <textarea
              placeholder="Write something for both of you..."
              value={data.shared_note}
              onChange={(e) =>
                updateField("shared_note", e.target.value)
              }
              rows={5}
              className="mt-5 w-full resize-none rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-3 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
            />
          </section>

          {/* Akshaya Task */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Akshaya
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#252525]">
                  Today&apos;s task
                </h2>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#666]">
                <input
                  type="checkbox"
                  checked={data.akshaya_task_done}
                  onChange={(e) =>
                    updateField(
                      "akshaya_task_done",
                      e.target.checked,
                    )
                  }
                  className="h-5 w-5 rounded border-black/20"
                />

                Done
              </label>
            </div>

            <input
              type="text"
              placeholder="Assign or write Akshaya's task..."
              value={data.akshaya_task}
              onChange={(e) =>
                updateField("akshaya_task", e.target.value)
              }
              className="mt-5 w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-3 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
            />
          </section>

          {/* Rishi Task */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Rishi
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#252525]">
                  Today&apos;s task
                </h2>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#666]">
                <input
                  type="checkbox"
                  checked={data.rishi_task_done}
                  onChange={(e) =>
                    updateField(
                      "rishi_task_done",
                      e.target.checked,
                    )
                  }
                  className="h-5 w-5 rounded border-black/20"
                />

                Done
              </label>
            </div>

            <input
              type="text"
              placeholder="Assign or write Rishi's task..."
              value={data.rishi_task}
              onChange={(e) =>
                updateField("rishi_task", e.target.value)
              }
              className="mt-5 w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-3 text-sm text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
            />
          </section>

          {/* Progress */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-[#252525]">
              Today&apos;s progress
            </h2>

            <p className="mt-1 text-sm text-[#888]">
              A quick view of the shared tasks.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-sm font-medium text-[#555]">
                  Akshaya
                </p>

                <p className="mt-1 text-sm text-[#888]">
                  {data.akshaya_task_done
                    ? "Task completed"
                    : "Task pending"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-sm font-medium text-[#555]">
                  Rishi
                </p>

                <p className="mt-1 text-sm text-[#888]">
                  {data.rishi_task_done
                    ? "Task completed"
                    : "Task pending"}
                </p>
              </div>
            </div>
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