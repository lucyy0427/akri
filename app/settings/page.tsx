export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-[#888]">AKRI · Preferences</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-3 text-[#777]">
          Manage your AKRI preferences and personal settings.
        </p>

        <section className="mt-10 space-y-5">
          {/* Profile */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Profile</p>

            <h2 className="mt-1 text-2xl font-semibold">
              Your profile
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#888]">Name</p>
                <p className="mt-1 font-medium">Rishi</p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#888]">Partner</p>
                <p className="mt-1 font-medium">Akshaya</p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Appearance</p>

            <h2 className="mt-1 text-2xl font-semibold">
              App appearance
            </h2>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4">
              <div>
                <p className="font-medium">Theme</p>
                <p className="mt-1 text-sm text-[#888]">
                  Choose how AKRI looks.
                </p>
              </div>

              <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-sm">
                System
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Notifications</p>

            <h2 className="mt-1 text-2xl font-semibold">
              Reminders
            </h2>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#f5f5f0] p-4">
              <div>
                <p className="font-medium">Daily reminders</p>
                <p className="mt-1 text-sm text-[#888]">
                  Meal, work, sleep, and routine reminders.
                </p>
              </div>

              <div className="h-6 w-11 rounded-full bg-[#dff5ea] p-1">
                <div className="h-4 w-4 rounded-full bg-[#285c47]" />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">About</p>

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