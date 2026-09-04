export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-[#888]">AKRI · Insights</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Analytics
        </h1>

        <p className="mt-3 text-[#777]">
          Understand your habits, progress, and shared life over time.
        </p>

        {/* Overview */}
        <section className="mt-10 grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Sleep</p>
            <p className="mt-3 text-2xl font-semibold">—</p>
            <p className="mt-2 text-xs text-[#999]">Weekly average</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Work</p>
            <p className="mt-3 text-2xl font-semibold">—</p>
            <p className="mt-2 text-xs text-[#999]">Hours this week</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Mood</p>
            <p className="mt-3 text-2xl font-semibold">—</p>
            <p className="mt-2 text-xs text-[#999]">Weekly trend</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Expenses</p>
            <p className="mt-3 text-2xl font-semibold">₹0</p>
            <p className="mt-2 text-xs text-[#999]">This month</p>
          </div>
        </section>

        {/* Charts */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Health</p>
            <h2 className="mt-1 text-2xl font-semibold">
              Sleep trend
            </h2>

            <div className="mt-6 flex h-64 items-center justify-center rounded-2xl bg-[#f5f5f0]">
              <p className="text-sm text-[#aaa]">
                Sleep chart will appear here.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Money</p>
            <h2 className="mt-1 text-2xl font-semibold">
              Expense trend
            </h2>

            <div className="mt-6 flex h-64 items-center justify-center rounded-2xl bg-[#f5f5f0]">
              <p className="text-sm text-[#aaa]">
                Expense chart will appear here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}