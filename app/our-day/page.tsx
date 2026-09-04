export default function OurDayPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-[#888]">AKRI</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Our Day
        </h1>

        <p className="mt-3 text-[#777]">
          Your shared daily tracker.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Akshaya</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Today&apos;s progress
            </h2>
            <p className="mt-3 text-sm text-[#888]">
              Daily activities will appear here.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Rishi</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Today&apos;s progress
            </h2>
            <p className="mt-3 text-sm text-[#888]">
              Daily activities will appear here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}