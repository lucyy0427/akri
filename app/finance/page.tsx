export default function FinancePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f0] px-6 py-10 text-[#252525] md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-[#888]">AKRI · Money</p>

        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Finance
        </h1>

        <p className="mt-3 text-[#777]">
          Keep track of your income, expenses, and financial progress.
        </p>

        {/* Summary */}
        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Income</p>
            <p className="mt-3 text-3xl font-semibold">₹0</p>
            <p className="mt-2 text-sm text-[#888]">This month</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Expenses</p>
            <p className="mt-3 text-3xl font-semibold">₹0</p>
            <p className="mt-2 text-sm text-[#888]">This month</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-[#888]">Balance</p>
            <p className="mt-3 text-3xl font-semibold">₹0</p>
            <p className="mt-2 text-sm text-[#888]">This month</p>
          </div>
        </section>

        {/* Transactions */}
        <section className="mt-5 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888]">Transactions</p>
              <h2 className="mt-1 text-2xl font-semibold">
                Recent activity
              </h2>
            </div>

            <button className="rounded-xl bg-[#dff5ea] px-4 py-2 text-sm font-medium text-[#285c47] transition hover:bg-[#ccefe0]">
              + Add
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-[#f5f5f0] p-8 text-center">
            <p className="text-sm text-[#888]">
              No transactions yet.
            </p>

            <p className="mt-1 text-xs text-[#aaa]">
              Your income and expenses will appear here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}