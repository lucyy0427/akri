"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Moon,
  Plus,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Profile = {
  user_id: string;
  person: "akshaya" | "rishi";
};

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

type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_date: string;
  reminder_time: string;
  completed: boolean;
};

type Task = {
  id: string;
  created_by: string;
  assigned_to: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
};

type FinanceEntry = {
  id: string;
  entry_type: "income" | "expense";
  amount: number | string;
  entry_date: string;
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStartString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}-01`;
}

export default function DashboardPage() {
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [akshaya, setAkshaya] = useState<Tracker | null>(null);
  const [rishi, setRishi] = useState<Tracker | null>(null);
  const [shared, setShared] = useState<SharedDay | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setMessage("");

      const currentDate = getLocalDateString();
      const monthStart = getMonthStartString();

      setToday(currentDate);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You are not logged in.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("akri_profiles")
          .select("person")
          .eq("user_id", user.id)
          .maybeSingle();

      if (profileError || !profile) {
        console.error(profileError);
        setMessage("Could not verify your AKRI profile.");
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } =
        await supabase
          .from("akri_profiles")
          .select("user_id, person");

      if (profilesError) {
        console.error(profilesError);
        setMessage("Could not load AKRI profiles.");
        setLoading(false);
        return;
      }

      const loadedProfiles = (profilesData ?? []) as Profile[];
      setProfiles(loadedProfiles);

      const { data: trackers, error: trackerError } =
        await supabase
          .from("daily_tracker")
          .select(
            "user_id, mood, wake_time, sleep_time, work_minutes, college_minutes, social_media_minutes, workout_done",
          )
          .eq("entry_date", currentDate);

      if (trackerError) {
        console.error(trackerError);
        setMessage("Could not load today's personal data.");
        setLoading(false);
        return;
      }

      const akshayaProfile = loadedProfiles.find(
        (item) => item.person === "akshaya",
      );

      const rishiProfile = loadedProfiles.find(
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

      const { data: sharedDay, error: sharedError } =
        await supabase
          .from("our_day")
          .select(
            "shared_note, akshaya_task, rishi_task, akshaya_task_done, rishi_task_done",
          )
          .eq("entry_date", currentDate)
          .maybeSingle();

      if (sharedError) {
        console.error(sharedError);
        setMessage("Could not load today's shared data.");
        setLoading(false);
        return;
      }

      setShared(sharedDay ?? null);

      const { data: taskData, error: taskError } =
        await supabase
          .from("tasks")
          .select(
            "id, created_by, assigned_to, title, description, due_date, due_time, completed",
          )
          .eq("completed", false)
          .order("due_date", { ascending: true })
          .order("due_time", { ascending: true });

      if (taskError) {
        console.error(taskError);
        setMessage("Could not load today's tasks.");
        setLoading(false);
        return;
      }

      setTasks((taskData ?? []) as Task[]);

      const { data: reminderData, error: reminderError } =
        await supabase
          .from("reminders")
          .select(
            "id, user_id, title, description, reminder_date, reminder_time, completed",
          )
          .eq("user_id", user.id)
          .eq("completed", false)
          .order("reminder_date", { ascending: true })
          .order("reminder_time", { ascending: true });

      if (reminderError) {
        console.error(reminderError);
        setMessage("Could not load your reminders.");
        setLoading(false);
        return;
      }

      setReminders((reminderData ?? []) as Reminder[]);

      const { data: financeData, error: financeError } =
        await supabase
          .from("finance_entries")
          .select("id, entry_type, amount, entry_date")
          .eq("user_id", user.id)
          .gte("entry_date", monthStart)
          .lte("entry_date", currentDate)
          .order("entry_date", { ascending: false });

      if (financeError) {
        console.error(financeError);
      } else {
        const financeEntries = (financeData ??
          []) as FinanceEntry[];

        let income = 0;
        let expenses = 0;

        for (const entry of financeEntries) {
          const amount = Number(entry.amount) || 0;

          if (entry.entry_type === "income") {
            income += amount;
          } else {
            expenses += amount;
          }
        }

        setMonthlyIncome(income);
        setMonthlyExpenses(expenses);
      }

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

  function getPersonName(userId: string) {
    const profile = profiles.find(
      (item) => item.user_id === userId,
    );

    if (!profile) {
      return "Unknown";
    }

    return profile.person === "akshaya" ? "Akshaya" : "Rishi";
  }

  function formatDueTime(time: string | null) {
    if (!time) {
      return "";
    }

    const [hourString, minuteString] = time
      .slice(0, 5)
      .split(":");

    const hour = Number(hourString);
    const minute = Number(minuteString);

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${String(minute).padStart(
      2,
      "0",
    )} ${suffix}`;
  }

  function calculateSleepDuration(tracker: Tracker | null) {
    if (!tracker?.wake_time || !tracker?.sleep_time) {
      return "—";
    }

    const [sleepHour, sleepMinute] = tracker.sleep_time
      .slice(0, 5)
      .split(":")
      .map(Number);

    const [wakeHour, wakeMinute] = tracker.wake_time
      .slice(0, 5)
      .split(":")
      .map(Number);

    let sleepMinutes = sleepHour * 60 + sleepMinute;
    const wakeMinutes = wakeHour * 60 + wakeMinute;

    if (sleepMinutes > wakeMinutes) {
      sleepMinutes -= 24 * 60;
    }

    const duration = wakeMinutes - sleepMinutes;

    if (duration <= 0) {
      return "—";
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return minutes === 0
      ? `${hours}h`
      : `${hours}h ${minutes}m`;
  }

  function formatDate(dateString: string) {
    if (!dateString) {
      return "";
    }

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const attentionTasks = tasks
    .filter((task) => {
      if (!task.due_date) {
        return true;
      }

      return task.due_date <= today;
    })
    .slice(0, 5);

  const overdueCount = tasks.filter(
    (task) =>
      task.due_date &&
      task.due_date < today,
  ).length;

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10 dark:bg-[#111] dark:text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#777] dark:text-[#aaa]">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10 dark:bg-[#111] dark:text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
            <h1 className="text-2xl font-semibold">
              Dashboard
            </h1>

            <p className="mt-3 text-sm text-[#777] dark:text-[#aaa]">
              {message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] p-5 pb-24 text-[#252525] transition-colors md:p-10 md:pb-10 dark:bg-[#111] dark:text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-[#888]">
            AKRI
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
            Your shared life and work overview.
          </p>

          {today && (
            <p className="mt-3 text-xs text-[#999]">
              {formatDate(today)}
            </p>
          )}
        </div>

        {/* Today's Tasks */}
        <section className="mb-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Attention
                </p>

                {overdueCount > 0 && (
                  <span className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-[11px] text-[#777] dark:bg-[#292929]">
                    {overdueCount} overdue
                  </span>
                )}
              </div>

              <h2 className="mt-1 text-2xl font-semibold">
                Today&apos;s Tasks
              </h2>

              <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
                The things that need your attention.
              </p>
            </div>

            <Link
              href="/tasks"
              className="w-fit rounded-xl bg-[#252525] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#111]"
            >
              View all tasks
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {attentionTasks.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f5f0] p-6 text-center dark:bg-[#292929]">
                <CheckCircle2
                  size={22}
                  className="mx-auto text-[#777]"
                  strokeWidth={1.7}
                />

                <p className="mt-3 text-sm font-medium text-[#555] dark:text-[#ddd]">
                  Nothing urgent right now.
                </p>

                <p className="mt-1 text-xs text-[#999]">
                  You&apos;re all caught up.
                </p>
              </div>
            ) : (
              attentionTasks.map((task) => {
                const isOverdue =
                  Boolean(task.due_date) &&
                  task.due_date! < today;

                return (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-2xl border border-black/5 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">
                          {task.title}
                        </h3>

                        <span className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-xs text-[#777] dark:bg-[#292929]">
                          {getPersonName(task.assigned_to)}
                        </span>

                        {isOverdue && (
                          <span className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-xs text-[#777] dark:bg-[#292929]">
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="mt-1 text-sm text-[#777] dark:text-[#aaa]">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs text-[#999]">
                      <Clock3 size={14} strokeWidth={1.7} />

                      {isOverdue ? "Was due " : "Due "}

                      {task.due_date
                        ? task.due_date
                        : "No date"}

                      {task.due_time
                        ? ` · ${formatDueTime(task.due_time)}`
                        : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Today's Reminders */}
        <section className="mb-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Personal
                </p>

                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f5f5f0] dark:bg-[#292929]">
                  <Bell size={15} strokeWidth={1.7} />
                </span>
              </div>

              <h2 className="mt-1 text-2xl font-semibold">
                Today&apos;s Reminders
              </h2>

              <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
                Your pending reminders, kept close to the day.
              </p>
            </div>

            <Link
              href="/reminders"
              className="w-fit rounded-xl bg-[#252525] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#111]"
            >
              View all reminders
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {reminders.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f5f0] p-6 text-center dark:bg-[#292929]">
                <CheckCircle2
                  size={22}
                  className="mx-auto text-[#777]"
                  strokeWidth={1.7}
                />

                <p className="mt-3 text-sm font-medium text-[#555] dark:text-[#ddd]">
                  No pending reminders.
                </p>

                <p className="mt-1 text-xs text-[#999]">
                  You&apos;re all clear for now.
                </p>
              </div>
            ) : (
              reminders.slice(0, 5).map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/5 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium">
                      {reminder.title}
                    </h3>

                    {reminder.description && (
                      <p className="mt-1 text-sm text-[#777] dark:text-[#aaa]">
                        {reminder.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-xs text-[#999]">
                    <Clock3 size={14} strokeWidth={1.7} />
                    {reminder.reminder_date}
                    {reminder.reminder_time
                      ? ` · ${formatDueTime(
                          reminder.reminder_time,
                        )}`
                      : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Monthly Finance */}
        <section className="mb-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Money
                </p>

                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f5f5f0] dark:bg-[#292929]">
                  <Wallet size={15} strokeWidth={1.7} />
                </span>
              </div>

              <h2 className="mt-1 text-2xl font-semibold">
                This Month
              </h2>

              <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
                Your personal finance snapshot.
              </p>
            </div>

            <Link
              href="/finance"
              className="w-fit rounded-xl bg-[#252525] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#111]"
            >
              Open Finance
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[#f5f5f0] p-5 dark:bg-[#292929]">
              <p className="text-xs text-[#999]">
                Income
              </p>

              <p className="mt-2 text-xl font-semibold">
                ₹{monthlyIncome.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5 dark:bg-[#292929]">
              <p className="text-xs text-[#999]">
                Expenses
              </p>

              <p className="mt-2 text-xl font-semibold">
                ₹{monthlyExpenses.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-5 dark:bg-[#292929]">
              <p className="text-xs text-[#999]">
                Balance
              </p>

              <p className="mt-2 text-xl font-semibold">
                ₹{monthlyBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </section>

        {/* Shared overview */}
        <section className="mb-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                Together
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Our Day
              </h2>

              <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
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
            <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#555] dark:text-[#ddd]">
                  Akshaya&apos;s task
                </p>

                <span className="text-xs text-[#888]">
                  {shared?.akshaya_task_done
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
                {shared?.akshaya_task || "No task assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#555] dark:text-[#ddd]">
                  Rishi&apos;s task
                </p>

                <span className="text-xs text-[#888]">
                  {shared?.rishi_task_done
                    ? "Completed"
                    : "Pending"}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#777] dark:text-[#aaa]">
                {shared?.rishi_task || "No task assigned"}
              </p>
            </div>
          </div>
        </section>

        {/* Personal cards */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* Akshaya */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Personal
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Akshaya
                </h2>
              </div>

              <Link
                href="/akshaya"
                className="text-sm text-[#777] underline-offset-4 hover:text-[#252525] hover:underline dark:text-[#aaa] dark:hover:text-white"
              >
                Open
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  Mood
                </p>

                <p className="mt-1 text-sm font-medium">
                  {akshaya?.mood || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  Progress
                </p>

                <p className="mt-1 text-sm font-medium">
                  {personProgress(akshaya)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  Work
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatMinutes(akshaya?.work_minutes)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  College
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatMinutes(akshaya?.college_minutes)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
              <div>
                <p className="text-xs text-[#999]">
                  Workout
                </p>

                <p className="mt-1 text-sm font-medium">
                  {akshaya?.workout_done
                    ? "Completed"
                    : "Not completed"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#999]">
                <Moon size={14} strokeWidth={1.7} />
                Sleep: {calculateSleepDuration(akshaya)}
              </div>
            </div>
          </section>

          {/* Rishi */}
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
                  Personal
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  Rishi
                </h2>
              </div>

              <Link
                href="/rishi"
                className="text-sm text-[#777] underline-offset-4 hover:text-[#252525] hover:underline dark:text-[#aaa] dark:hover:text-white"
              >
                Open
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  Mood
                </p>

                <p className="mt-1 text-sm font-medium">
                  {rishi?.mood || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  Progress
                </p>

                <p className="mt-1 text-sm font-medium">
                  {personProgress(rishi)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  Work
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatMinutes(rishi?.work_minutes)}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
                <p className="text-xs text-[#999]">
                  College
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatMinutes(rishi?.college_minutes)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4 dark:bg-[#292929]">
              <div>
                <p className="text-xs text-[#999]">
                  Workout
                </p>

                <p className="mt-1 text-sm font-medium">
                  {rishi?.workout_done
                    ? "Completed"
                    : "Not completed"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#999]">
                <Moon size={14} strokeWidth={1.7} />
                Sleep: {calculateSleepDuration(rishi)}
              </div>
            </div>
          </section>
        </div>

        {/* Quick actions */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1d1d1d]">
          <p className="text-xs font-medium uppercase tracking-wider text-[#999]">
            Quick actions
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/tasks"
              className="group flex items-center gap-3 rounded-2xl bg-[#f5f5f0] p-4 transition hover:bg-[#eeeeea] dark:bg-[#292929] dark:hover:bg-[#333]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1d1d1d]">
                <Plus size={17} strokeWidth={1.8} />
              </span>

              <div>
                <p className="text-sm font-medium">
                  Add task
                </p>

                <p className="mt-0.5 text-xs text-[#999]">
                  Assign something
                </p>
              </div>
            </Link>

            <Link
              href="/reminders"
              className="group flex items-center gap-3 rounded-2xl bg-[#f5f5f0] p-4 transition hover:bg-[#eeeeea] dark:bg-[#292929] dark:hover:bg-[#333]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1d1d1d]">
                <Bell size={17} strokeWidth={1.8} />
              </span>

              <div>
                <p className="text-sm font-medium">
                  Add reminder
                </p>

                <p className="mt-0.5 text-xs text-[#999]">
                  Keep something in mind
                </p>
              </div>
            </Link>

            <Link
              href="/our-day"
              className="group flex items-center gap-3 rounded-2xl bg-[#f5f5f0] p-4 transition hover:bg-[#eeeeea] dark:bg-[#292929] dark:hover:bg-[#333]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1d1d1d]">
                <CheckCircle2 size={17} strokeWidth={1.8} />
              </span>

              <div>
                <p className="text-sm font-medium">
                  Update Our Day
                </p>

                <p className="mt-0.5 text-xs text-[#999]">
                  Shared progress
                </p>
              </div>
            </Link>

            <Link
              href="/finance"
              className="group flex items-center gap-3 rounded-2xl bg-[#f5f5f0] p-4 transition hover:bg-[#eeeeea] dark:bg-[#292929] dark:hover:bg-[#333]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-[#1d1d1d]">
                <Wallet size={17} strokeWidth={1.8} />
              </span>

              <div>
                <p className="text-sm font-medium">
                  Add finance
                </p>

                <p className="mt-0.5 text-xs text-[#999]">
                  Income or expense
                </p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}