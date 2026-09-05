"use client";

import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "../../lib/supabase/client";

type Person = "akshaya" | "rishi";
type Theme = "system" | "light" | "dark";

export default function SettingsPage() {
  const supabase = createClient();
  const { theme: nextTheme, setTheme } = useTheme();

  const [userId, setUserId] = useState("");
  const [selectedPerson, setSelectedPerson] =
    useState<Person>("rishi");
  const [name, setName] = useState("Rishi");
  const [theme, setThemeState] = useState<Theme>("system");
  const [dailyReminders, setDailyReminders] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  /*
   * Wait until the browser has mounted.
   * This prevents theme/localStorage hydration issues.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Load saved AKRI settings.
   */
  useEffect(() => {
    if (!mounted) return;

    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      /*
       * Load profile
       */
      const { data: profile } = await supabase
        .from("akri_profiles")
        .select("person")
        .eq("user_id", user.id)
        .maybeSingle();

      if (
        profile?.person === "akshaya" ||
        profile?.person === "rishi"
      ) {
        const person = profile.person as Person;

        setSelectedPerson(person);

        const savedName = localStorage.getItem("akri-name");

        if (savedName) {
          setName(savedName);
        } else {
          setName(
            person === "akshaya"
              ? "Akshaya"
              : "Rishi",
          );
        }
      }

      /*
       * Load saved theme.
       *
       * next-themes already stores the selected theme,
       * but we also keep AKRI's own value for consistency.
       */
      const savedTheme =
        localStorage.getItem("akri-theme");

      if (
        savedTheme === "system" ||
        savedTheme === "light" ||
        savedTheme === "dark"
      ) {
        setThemeState(savedTheme);
        setTheme(savedTheme);
      } else if (
        nextTheme === "system" ||
        nextTheme === "light" ||
        nextTheme === "dark"
      ) {
        setThemeState(nextTheme);
      }

      /*
       * Load reminder preference
       */
      const savedReminders =
        localStorage.getItem(
          "akri-daily-reminders",
        );

      if (savedReminders !== null) {
        setDailyReminders(
          savedReminders === "true",
        );
      }

      setLoading(false);
    }

    loadSettings();
  }, [mounted]);

  /*
   * Keep our local theme state synchronized
   * with next-themes.
   */
  useEffect(() => {
    if (!mounted) return;

    if (
      nextTheme === "system" ||
      nextTheme === "light" ||
      nextTheme === "dark"
    ) {
      setThemeState(nextTheme);
    }
  }, [nextTheme, mounted]);

  /*
   * Change theme immediately.
   */
  function changeTheme(selectedTheme: Theme) {
    setThemeState(selectedTheme);
    setTheme(selectedTheme);

    /*
     * Explicitly save the theme as well.
     * This makes the preference survive refreshes.
     */
    localStorage.setItem(
      "akri-theme",
      selectedTheme,
    );
  }

  /*
   * Save all AKRI settings.
   */
  async function saveSettings() {
    if (!userId) return;

    /*
     * Save local preferences.
     */
    localStorage.setItem(
      "akri-name",
      name,
    );

    localStorage.setItem(
      "akri-theme",
      theme,
    );

    localStorage.setItem(
      "akri-daily-reminders",
      String(dailyReminders),
    );

    /*
     * Tell next-themes about the selected theme.
     */
    setTheme(theme);

    /*
     * Save profile to Supabase.
     */
    const { error } = await supabase
      .from("akri_profiles")
      .update({
        person: selectedPerson,
      })
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Failed to save profile:",
        error,
      );
      return;
    }

    /*
     * Show saved state.
     */
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  if (loading || !mounted) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] dark:bg-[#111] dark:text-white md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-[#888]">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 pb-24 text-[#252525] transition-colors md:px-10 dark:bg-[#111] dark:text-white">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <p className="text-sm text-[#888]">
          AKRI · Preferences
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Settings
            </h1>

            <p className="mt-3 text-[#777] dark:text-[#aaa]">
              Manage your AKRI preferences and
              personal settings.
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="flex w-fit items-center gap-2 rounded-xl bg-[#252525] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            {saved ? (
              <Check size={17} />
            ) : (
              <Save size={17} />
            )}

            {saved
              ? "Saved"
              : "Save changes"}
          </button>
        </div>

        <section className="mt-10 space-y-5">

          {/* Profile */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#1d1d1d]">
            <p className="text-sm text-[#888]">
              Profile
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Your profile
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-[#888]">
                  Name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/5 bg-[#f5f5f0] px-4 py-3 text-sm outline-none transition focus:border-black/20 dark:border-white/10 dark:bg-[#292929] dark:text-white"
                  placeholder="Your name"
                />
              </div>

              {/* Profile */}
              <div>
                <label className="text-xs font-medium text-[#888]">
                  AKRI profile
                </label>

                <select
                  value={selectedPerson}
                  onChange={(event) =>
                    setSelectedPerson(
                      event.target.value as Person,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-black/5 bg-[#f5f5f0] px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-[#292929] dark:text-white"
                >
                  <option value="akshaya">
                    Akshaya
                  </option>

                  <option value="rishi">
                    Rishi
                  </option>
                </select>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#aaa]">
              Your AKRI profile determines which
              personal tracker belongs to you.
            </p>
          </div>

          {/* Appearance */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#1d1d1d]">
            <p className="text-sm text-[#888]">
              Appearance
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              App appearance
            </h2>

            <div className="mt-6 grid gap-3 md:grid-cols-3">

              {(
                ["system", "light", "dark"] as Theme[]
              ).map((option) => {
                const active =
                  theme === option;

                return (
                  <button
                    key={option}
                    onClick={() =>
                      changeTheme(option)
                    }
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-[#285c47] bg-[#dff5ea] dark:bg-[#234437]"
                        : "border-black/5 bg-[#f5f5f0] hover:bg-white dark:border-white/10 dark:bg-[#292929] dark:hover:bg-[#333]"
                    }`}
                  >
                    <p className="font-medium capitalize">
                      {option}
                    </p>

                    <p className="mt-1 text-xs text-[#888]">
                      {option === "system"
                        ? "Follow your device"
                        : option === "light"
                          ? "Bright and minimal"
                          : "Dark and calm"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#1d1d1d]">
            <p className="text-sm text-[#888]">
              Notifications
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Reminders
            </h2>

            <button
              onClick={() =>
                setDailyReminders(
                  !dailyReminders,
                )
              }
              className="mt-6 flex w-full items-center justify-between rounded-2xl bg-[#f5f5f0] p-4 text-left dark:bg-[#292929]"
            >
              <div>
                <p className="font-medium">
                  Daily reminders
                </p>

                <p className="mt-1 text-sm text-[#888]">
                  Meal, work, sleep, and routine
                  reminders.
                </p>
              </div>

              <div
                className={`h-6 w-11 rounded-full p-1 transition ${
                  dailyReminders
                    ? "bg-[#dff5ea]"
                    : "bg-[#555]"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full transition ${
                    dailyReminders
                      ? "translate-x-5 bg-[#285c47]"
                      : "translate-x-0 bg-white"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* About */}
          <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-[#1d1d1d]">
            <p className="text-sm text-[#888]">
              About
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              AKRI
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#888]">
              A private Life + Work OS for two.
            </p>

            <p className="mt-4 text-xs text-[#aaa]">
              Version 0.1
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}