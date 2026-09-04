"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type FinanceEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: "income" | "expense";
  category: string;
  description: string | null;
  amount: number;
  payment_method: string | null;
};

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Work",
  "Salary",
  "Other",
];

const paymentMethods = [
  "Cash",
  "UPI",
  "Card",
  "Bank transfer",
  "Other",
];

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [entryType, setEntryType] = useState<"income" | "expense">(
    "expense",
  );
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(() => {
    async function loadFinance() {
        const currentDate = new Date().toISOString().split("T")[0];
        setToday(currentDate);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("You are not logged in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("finance_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(`Could not load finance data: ${error.message}`);
        setLoading(false);
        return;
      }

      setEntries(data ?? []);
      setLoading(false);
    }

    loadFinance();
  }, []);

  async function addEntry() {
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("You are not logged in.");
      setSaving(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: newEntry, error } = await supabase
      .from("finance_entries")
      .insert({
        user_id: user.id,
        entry_date: today,
        entry_type: entryType,
        category,
        description: description || null,
        amount: Number(amount),
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (error) {
      setMessage(`Could not save: ${error.message}`);
      setSaving(false);
      return;
    }

    if (newEntry) {
      setEntries((current) => [newEntry, ...current]);
    }

    setDescription("");
    setAmount("");
    setEntryType("expense");
    setCategory("Food");
    setPaymentMethod("UPI");
    setShowForm(false);
    setMessage("Transaction added.");

    setSaving(false);
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase
      .from("finance_entries")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(`Could not delete: ${error.message}`);
      return;
    }

    setEntries((current) =>
      current.filter((entry) => entry.id !== id),
    );

    setMessage("Transaction deleted.");
  }

  const currentMonthEntries = entries.filter((entry) => {
  if (!today) return false;

  const currentDate = new Date(`${today}T00:00:00`);
  const date = new Date(`${entry.entry_date}T00:00:00`);

  return (
    date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear()
  );
});

  const totalIncome = currentMonthEntries
    .filter((entry) => entry.entry_type === "income")
    .reduce((total, entry) => total + Number(entry.amount), 0);

  const totalExpenses = currentMonthEntries
    .filter((entry) => entry.entry_type === "expense")
    .reduce((total, entry) => total + Number(entry.amount), 0);

  const balance = totalIncome - totalExpenses;

  function formatAmount(value: number) {
    return `₹${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f0] p-6 text-[#252525] md:p-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-[#777]">
            Loading your finances...
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
          <p className="text-sm text-[#888]">AKRI · Money</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#252525]">
            Finance
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Keep track of your income, expenses, and financial progress.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-5 md:grid-cols-3">

          <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-sm text-[#888]">Income</p>

            <p className="mt-4 text-3xl font-semibold text-[#252525]">
              {formatAmount(totalIncome)}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              This month
            </p>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-sm text-[#888]">Expenses</p>

            <p className="mt-4 text-3xl font-semibold text-[#252525]">
              {formatAmount(totalExpenses)}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              This month
            </p>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-sm text-[#888]">Balance</p>

            <p className="mt-4 text-3xl font-semibold text-[#252525]">
              {formatAmount(balance)}
            </p>

            <p className="mt-2 text-sm text-[#888]">
              Income minus expenses
            </p>
          </section>
        </div>

        {/* Transactions */}
        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-[#888]">
                Transactions
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#252525]">
                Recent activity
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="w-fit rounded-xl bg-[#dff5eb] px-5 py-3 text-sm font-medium text-[#28644d] transition hover:bg-[#ccefe1]"
            >
              {showForm ? "Close" : "+ Add"}
            </button>
          </div>

          {/* Add form */}
          {showForm && (
            <div className="mt-6 rounded-2xl bg-[#f5f5f0] p-5">

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="text-sm text-[#666]">
                    Type
                  </label>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEntryType("expense")}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm ${
                        entryType === "expense"
                          ? "bg-[#252525] text-white"
                          : "bg-white text-[#666]"
                      }`}
                    >
                      Expense
                    </button>

                    <button
                      type="button"
                      onClick={() => setEntryType("income")}
                      className={`flex-1 rounded-xl px-4 py-2.5 text-sm ${
                        entryType === "income"
                          ? "bg-[#252525] text-white"
                          : "bg-white text-[#666]"
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                <label className="text-sm text-[#666]">
                  Amount

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                  />
                </label>

                <label className="text-sm text-[#666]">
                  Category

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-[#666]">
                  Payment method

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[#252525] outline-none focus:border-black/20"
                  >
                    {paymentMethods.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-[#666] md:col-span-2">
                  Description

                  <input
                    type="text"
                    placeholder="What was this for?"
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[#252525] outline-none placeholder:text-[#999] focus:border-black/20"
                  />
                </label>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={addEntry}
                  disabled={saving}
                  className="rounded-xl bg-[#252525] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#111] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save transaction"}
                </button>

                {message && (
                  <p className="text-sm text-[#777]">
                    {message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Transaction list */}
          <div className="mt-6">

            {entries.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f5f0] p-10 text-center">
                <p className="text-sm text-[#777]">
                  No transactions yet.
                </p>

                <p className="mt-1 text-xs text-[#999]">
                  Your income and expenses will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#252525]">
                          {entry.description ||
                            entry.category}
                        </p>

                        <span className="rounded-full bg-[#f5f5f0] px-2.5 py-1 text-xs text-[#888]">
                          {entry.category}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#999]">
                        {entry.entry_date}
                        {entry.payment_method
                          ? ` · ${entry.payment_method}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <p
                        className={`font-semibold ${
                          entry.entry_type === "income"
                            ? "text-[#28644d]"
                            : "text-[#555]"
                        }`}
                      >
                        {entry.entry_type === "income"
                          ? "+"
                          : "-"}
                        {formatAmount(Number(entry.amount))}
                      </p>

                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-xs text-[#999] hover:text-[#555]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && !showForm && (
            <p className="mt-4 text-sm text-[#777]">
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}