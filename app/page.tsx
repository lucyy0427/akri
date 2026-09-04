

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] text-[#252525]">
      <div className="min-h-screen">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#888]">Today</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Good morning
                </h1>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-medium shadow-sm">
                R
              </div>
            </header>

            {/* Welcome */}
            <section className="mt-14">
              <p className="text-sm font-medium text-[#777]">
                Welcome back
              </p>

              <h2 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                Your day, together.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#777]">
                A private space for life, work, health, money, and everything
                you build together.
              </p>
            </section>

            {/* Overview Cards */}
            <section className="mt-12 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-[#777]">Today</p>
                <p className="mt-3 text-2xl font-semibold">Our Day</p>
                <p className="mt-2 text-sm text-[#888]">
                  Shared daily tracker
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-[#777]">Health</p>
                <p className="mt-3 text-2xl font-semibold">Sleep</p>
                <p className="mt-2 text-sm text-[#888]">
                  Track sleep and routines
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm text-[#777]">Money</p>
                <p className="mt-3 text-2xl font-semibold">Finance</p>
                <p className="mt-2 text-sm text-[#888]">
                  Income and expenses
                </p>
              </div>
            </section>
          </div>
        </div>
            </div>

    </main>
  );
}