"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_date: string;
  reminder_time: string;
  completed: boolean;
};

function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function RemindersPage() {
  const supabase = createClient();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  useEffect(() => {
    setReminderDate(getLocalDateString());

    async function loadInitialReminders() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reminders")
        .select(
          "id, user_id, title, description, reminder_date, reminder_time, completed",
        )
        .eq("user_id", user.id)
        .order("reminder_date", { ascending: true })
        .order("reminder_time", { ascending: true });

      if (!error) {
        setReminders((data ?? []) as Reminder[]);
      }

      setLoading(false);
    }

    loadInitialReminders();
  }, [supabase]);

  async function loadReminders() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reminders")
      .select(
        "id, user_id, title, description, reminder_date, reminder_time, completed",
      )
      .eq("user_id", user.id)
      .order("reminder_date", { ascending: true })
      .order("reminder_time", { ascending: true });

    if (!error) {
      setReminders((data ?? []) as Reminder[]);
    }

    setLoading(false);
  }

  async function addReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !reminderDate || !reminderTime) {
      setMessage("Please enter a title, date, and time.");
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in first.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("reminders").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      reminder_date: reminderDate,
      reminder_time: reminderTime,
      completed: false,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setDescription("");
    setReminderTime("");
    setMessage("Reminder added.");

    await loadReminders();

    setSaving(false);
  }

  async function toggleReminder(reminder: Reminder) {
    const { error } = await supabase
      .from("reminders")
      .update({
        completed: !reminder.completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reminder.id);

    if (!error) {
      setReminders((current) =>
        current.map((item) =>
          item.id === reminder.id
            ? { ...item, completed: !item.completed }
            : item,
        ),
      );
    }
  }

  async function deleteReminder(id: string) {
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);

    if (!error) {
      setReminders((current) =>
        current.filter((reminder) => reminder.id !== id),
      );
    }
  }

  const pendingReminders = reminders.filter(
    (reminder) => !reminder.completed,
  );

  const completedReminders = reminders.filter(
    (reminder) => reminder.completed,
  );

  return (
    <main className="min-h-screen bg-[#fafaf7] px-5 py-8 text-[#252525] md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm text-[#999]">AKRI</p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Reminders
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Keep important things visible without carrying them in your head.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef8f3]">
                <Plus size={19} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="font-medium">New reminder</h2>

                <p className="text-xs text-[#999]">
                  Add something you do not want to forget.
                </p>
              </div>
            </div>

            <form onSubmit={addReminder} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#666]">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Go for a walk"
                  className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm outline-none transition focus:border-black/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#666]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional note..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm outline-none transition focus:border-black/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#666]">
                    Date
                  </label>

                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(event) =>
                      setReminderDate(event.target.value)
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#666]">
                    Time
                  </label>

                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(event) =>
                      setReminderTime(event.target.value)
                    }
                    className="w-full rounded-xl border border-black/10 bg-[#fafaf7] px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#252525] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={17} />

                {saving ? "Saving..." : "Add reminder"}
              </button>

              {message && (
                <p className="text-center text-xs text-[#777]">
                  {message}
                </p>
              )}
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-medium">Pending</h2>

                  <p className="mt-1 text-xs text-[#999]">
                    {pendingReminders.length} reminder
                    {pendingReminders.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-[#999]">
                  Loading reminders...
                </p>
              ) : pendingReminders.length === 0 ? (
                <div className="rounded-2xl bg-[#fafaf7] px-5 py-8 text-center">
                  <p className="text-sm text-[#777]">
                    No pending reminders.
                  </p>

                  <p className="mt-1 text-xs text-[#aaa]">
                    Your list is clear.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-3 rounded-2xl border border-black/5 bg-[#fafaf7] p-4"
                    >
                      <button
                        onClick={() => toggleReminder(reminder)}
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-[#eef8f3]"
                        aria-label="Complete reminder"
                      >
                        <Check size={16} strokeWidth={1.8} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium">
                          {reminder.title}
                        </h3>

                        {reminder.description && (
                          <p className="mt-1 text-xs leading-5 text-[#888]">
                            {reminder.description}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-[#999]">
                          {reminder.reminder_date} ·{" "}
                          {reminder.reminder_time.slice(0, 5)}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#aaa] transition hover:bg-white hover:text-[#555]"
                        aria-label="Delete reminder"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedReminders.length > 0 && (
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="font-medium">Completed</h2>

                  <p className="mt-1 text-xs text-[#999]">
                    {completedReminders.length} completed
                  </p>
                </div>

                <div className="space-y-3">
                  {completedReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-3 rounded-2xl border border-black/5 bg-[#fafaf7] p-4"
                    >
                      <button
                        onClick={() => toggleReminder(reminder)}
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef8f3]"
                        aria-label="Reopen reminder"
                      >
                        <Check size={16} strokeWidth={1.8} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm text-[#999] line-through">
                          {reminder.title}
                        </h3>

                        <p className="mt-2 text-xs text-[#aaa]">
                          {reminder.reminder_date} ·{" "}
                          {reminder.reminder_time.slice(0, 5)}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#aaa] transition hover:bg-white hover:text-[#555]"
                        aria-label="Delete reminder"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}