
"use client"

import { useEffect, useState, use } from "react"
import { getExpenses } from "@/lib/store"
import { Expense } from "@/lib/types"
import ExpenseForm from "@/components/expenses/ExpenseForm"

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getExpenses();
      const found = data.find(e => e.id === id);
      setExpense(found || null);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-xs font-bold uppercase tracking-widest opacity-50">Loading...</div>;
  if (!expense) return <div className="p-20 text-center text-xs font-bold uppercase tracking-widest opacity-50">Expense record not found.</div>;

  return (
    <div className="py-10">
      <ExpenseForm initialData={expense} />
    </div>
  )
}
