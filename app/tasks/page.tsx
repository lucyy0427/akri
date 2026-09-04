"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Profile = {
  user_id: string;
  person: "akshaya" | "rishi";
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
  created_at: string;
};

export default function TasksPage() {
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You are not logged in.");
        setLoading(false);
        return;
      }

      setUserId(user.id);

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

      const otherPerson = loadedProfiles.find(
        (profile) => profile.user_id !== user.id,
      );

      if (otherPerson) {
        setAssignedTo(otherPerson.user_id);
      }

      const { data: taskData, error: taskError } =
        await supabase
          .from("tasks")
          .select(
            "id, created_by, assigned_to, title, description, due_date, due_time, completed, created_at",
          )
          .order("completed", { ascending: true })
          .order("due_date", { ascending: true })
          .order("due_time", { ascending: true });

      if (taskError) {
        console.error(taskError);
        setMessage("Could not load tasks.");
        setLoading(false);
        return;
      }

      setTasks((taskData ?? []) as Task[]);
      setLoading(false);
    }

    loadTasks();
  }, []);

  function getPersonName(id: string) {
    const profile = profiles.find(
      (profile) => profile.user_id === id,
    );

    if (!profile) {
      return "Unknown";
    }

    return profile.person === "akshaya" ? "Akshaya" : "Rishi";
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    if (!assignedTo) {
      setMessage("Please choose who this task is assigned to.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        created_by: userId,
        assigned_to: assignedTo,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        due_time: dueTime || null,
      })
      .select(
        "id, created_by, assigned_to, title, description, due_date, due_time, completed, created_at",
      )
      .single();

    if (error) {
      console.error(error);
      setMessage("Could not create task.");
      setSaving(false);
      return;
    }

    setTasks((current) => [...current, data as Task]);

    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setMessage("Task created successfully.");
    setSaving(false);
  }

  async function toggleTask(task: Task) {
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);

    if (error) {
      console.error(error);
      setMessage("Could not update task.");
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, completed: !item.completed }
          : item,
      ),
    );
  }

  async function deleteTask(id: string) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Could not delete task.");
      return;
    }

    setTasks((current) =>
      current.filter((task) => task.id !== id),
    );
  }

  const pendingTasks = tasks.filter(
    (task) => !task.completed,
  );

  const completedTasks = tasks.filter(
    (task) => task.completed,
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#777]">
            Loading tasks...
          </p>
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
            AKRI · Tasks
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Tasks
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Give each other tasks and keep track of what needs to get done.
          </p>
        </div>

        {/* Add task */}
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f5f0]">
              <Plus size={18} />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                Add a task
              </h2>

              <p className="text-sm text-[#888]">
                Create something for yourself or each other.
              </p>
            </div>
          </div>

          <form
            onSubmit={addTask}
            className="mt-6 grid gap-4"
          >
            <div>
              <label className="text-sm font-medium">
                Task
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Finish project report"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm outline-none transition focus:border-black/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Optional details..."
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm outline-none transition focus:border-black/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">

              <div>
                <label className="text-sm font-medium">
                  Assign to
                </label>

                <select
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm outline-none"
                >
                  {profiles.map((profile) => (
                    <option
                      key={profile.user_id}
                      value={profile.user_id}
                    >
                      {profile.person === "akshaya"
                        ? "Akshaya"
                        : "Rishi"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Due date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Due time
                </label>

                <input
                  type="time"
                  value={dueTime}
                  onChange={(event) =>
                    setDueTime(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#252525] px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
            >
              <Plus size={17} />

              {saving ? "Creating..." : "Create task"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-[#777]">
              {message}
            </p>
          )}
        </section>

        {/* Pending */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-[#888]">
                To do
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Pending tasks
              </h2>
            </div>

            <p className="text-sm text-[#999]">
              {pendingTasks.length} pending
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f5f0] p-6 text-center">
                <p className="text-sm text-[#888]">
                  No pending tasks.
                </p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-4 rounded-2xl border border-black/5 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">
                        {task.title}
                      </h3>

                      <span className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-xs text-[#777]">
                        For {getPersonName(task.assigned_to)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mt-2 text-sm text-[#777]">
                        {task.description}
                      </p>
                    )}

                    {(task.due_date || task.due_time) && (
                      <p className="mt-2 text-xs text-[#999]">
                        Due{" "}
                        {task.due_date
                          ? task.due_date
                          : ""}
                        {task.due_time
                          ? ` · ${task.due_time.slice(0, 5)}`
                          : ""}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[#aaa]">
                      Added by {getPersonName(task.created_by)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => toggleTask(task)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#f5f5f0] px-4 py-2.5 text-sm font-medium transition hover:bg-[#ededE7]"
                    >
                      <Check size={16} />
                      Done
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-[#999] transition hover:bg-[#f5f5f0] hover:text-[#555]"
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Completed */}
        {completedTasks.length > 0 && (
          <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">
              Completed
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Finished tasks
            </h2>

            <div className="mt-6 space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[#f5f5f0] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium line-through text-[#888]">
                        {task.title}
                      </h3>

                      <span className="rounded-full bg-white px-2.5 py-1 text-xs text-[#888]">
                        {getPersonName(task.assigned_to)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-[#aaa]">
                      Added by {getPersonName(task.created_by)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTask(task)}
                      className="rounded-xl bg-white px-4 py-2.5 text-sm text-[#777] transition hover:bg-white/70"
                    >
                      Reopen
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-[#999] transition hover:bg-white hover:text-[#555]"
                      aria-label="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}