export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-[#888]">AKRI</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-3 text-[#777]">
          Your shared life and work overview.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Today</p>
            <p className="mt-3 text-2xl font-semibold">Our Day</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Health</p>
            <p className="mt-3 text-2xl font-semibold">Sleep</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Money</p>
            <p className="mt-3 text-2xl font-semibold">Finance</p>
          </div>
        </div>
      </div>
    </main>
  );
}