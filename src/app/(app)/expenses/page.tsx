
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Wallet, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useStore, getExpenses, deleteExpense } from "@/lib/store"
import { Expense } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ExpensesList() {
  const { toast } = useToast()
  const { currentProfile } = useStore()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentProfile) {
      const fetchExpenses = async () => {
        setLoading(true)
        const data = await getExpenses();
        setExpenses(data);
        setLoading(false)
      }
      fetchExpenses()
    }
  }, [currentProfile])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      const success = await deleteExpense(id);
      if (success) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        toast({ title: "Expense Deleted" });
      }
    }
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(search.toLowerCase()) ||
    expense.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track your business spending and outgoings.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Outflow</p>
            <p className="text-lg font-black">MVR {totalSpent.toLocaleString()}</p>
          </div>
          <Button asChild className="rounded-full px-5 h-9 text-xs font-bold">
            <Link href="/expenses/new"><Plus className="mr-2 size-3.5" /> Log Expense</Link>
          </Button>
        </div>
      </div>

      <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
        <CardHeader className="border-b border-white/5 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Expense Journal</CardTitle>
              <CardDescription className="text-xs">History of all recorded expenditures.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search description or category..." 
                className="pl-9 h-9 text-xs" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5">
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Date</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Description</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Category</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Amount</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Status</TableHead>
                <TableHead className="text-right font-bold text-[9px] uppercase tracking-[0.2em] pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-48 text-center text-xs">Loading expenses...</TableCell></TableRow>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="border-white/5 text-xs">
                    <TableCell className="font-medium">{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-bold">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-wider h-4">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="font-black text-red-400">MVR {expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={expense.status === 'paid' ? 'default' : 'outline'} className="text-[9px] uppercase h-4">
                        {expense.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/expenses/${expense.id}/edit`}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet className="size-8 opacity-10" />
                      <p className="font-semibold text-sm">No expenses logged</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
