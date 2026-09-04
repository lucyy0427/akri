export default function SleepPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-[#888]">AKRI · Health</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Sleep
        </h1>

        <p className="mt-3 text-[#777]">
          Track sleep, wake times, and your progress over time.
        </p>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Akshaya</p>

            <h2 className="mt-2 text-2xl font-semibold">
              Sleep tracking
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#888]">Sleep</p>
                <p className="mt-1 text-lg font-medium">—</p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#888]">Wake</p>
                <p className="mt-1 text-lg font-medium">—</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Rishi</p>

            <h2 className="mt-2 text-2xl font-semibold">
              Sleep tracking
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#888]">Sleep</p>
                <p className="mt-1 text-lg font-medium">—</p>
              </div>

              <div className="rounded-2xl bg-[#f5f5f0] p-4">
                <p className="text-xs text-[#888]">Wake</p>
                <p className="mt-1 text-lg font-medium">—</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-[#888]">Rishi&apos;s goal</p>

          <h2 className="mt-2 text-2xl font-semibold">
            Gradual sleep schedule
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-[#f5f5f0] p-4">
              <p className="text-xs text-[#888]">Week 1</p>
              <p className="mt-2 font-medium">10:00 PM → 6:45 AM</p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-4">
              <p className="text-xs text-[#888]">Week 2</p>
              <p className="mt-2 font-medium">10:00 PM → 6:30 AM</p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-4">
              <p className="text-xs text-[#888]">Week 3</p>
              <p className="mt-2 font-medium">10:00 PM → 6:15 AM</p>
            </div>

            <div className="rounded-2xl bg-[#f5f5f0] p-4">
              <p className="text-xs text-[#888]">Week 4</p>
              <p className="mt-2 font-medium">10:00 PM → 6:00 AM</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}