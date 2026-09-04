export default function RishiPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-[#888]">AKRI · Personal</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Rishi
        </h1>

        <p className="mt-3 text-[#777]">
          Your personal life and work tracker.
        </p>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Health</p>
            <h2 className="mt-2 text-2xl font-semibold">Sleep</h2>
            <p className="mt-3 text-sm text-[#888]">
              Sleep and wake tracking.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Wellbeing</p>
            <h2 className="mt-2 text-2xl font-semibold">Mood</h2>
            <p className="mt-3 text-sm text-[#888]">
              Track how you feel each day.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Activity</p>
            <h2 className="mt-2 text-2xl font-semibold">Workout</h2>
            <p className="mt-3 text-sm text-[#888]">
              Workouts and notes.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Food</p>
            <h2 className="mt-2 text-2xl font-semibold">Meals</h2>
            <p className="mt-3 text-sm text-[#888]">
              Breakfast, lunch and dinner.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Work</p>
            <h2 className="mt-2 text-2xl font-semibold">Focus</h2>
            <p className="mt-3 text-sm text-[#888]">
              Money-earning and college work.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Digital</p>
            <h2 className="mt-2 text-2xl font-semibold">Social Media</h2>
            <p className="mt-3 text-sm text-[#888]">
              Track daily social media time.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}