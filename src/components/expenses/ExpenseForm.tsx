
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ChevronLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useStore, saveExpense } from "@/lib/store"
import { Expense } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

const categories = [
  "Salary & Benefits",
  "Rent & Utilities",
  "Materials & Stock",
  "Marketing & Ads",
  "Equipment & Tech",
  "Travel & Transport",
  "Legal & Professional",
  "Taxes & Fees",
  "Other"
]

const formSchema = z.object({
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string(),
  category: z.string().min(1, "Please select a category"),
  status: z.enum(["paid", "pending"]),
  notes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface ExpenseFormProps {
  initialData?: Expense
}

export default function ExpenseForm({ initialData }: ExpenseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { currentProfile } = useStore()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      description: initialData.description,
      amount: initialData.amount,
      date: initialData.date,
      category: initialData.category,
      status: initialData.status,
    } : {
      date: new Date().toISOString().split('T')[0],
      status: 'paid',
      category: 'Other'
    }
  })

  const onSubmit = async (data: FormData) => {
    if (!currentProfile) return;
    setLoading(true)

    try {
      const expenseData: Expense = {
        ...data,
        id: initialData?.id || uuidv4(),
        profile_id: currentProfile.id,
        description: data.description,
        amount: data.amount,
        date: data.date,
        category: data.category,
        status: data.status,
        createdAt: initialData?.createdAt || undefined
      }

      await saveExpense(expenseData);
      toast({ title: initialData ? "Expense Updated" : "Expense Logged" });
      router.push("/expenses");
    } catch (error) {
      toast({ title: "Error saving expense", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" type="button" onClick={() => router.back()}>
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="text-3xl font-black tracking-tight">
            {initialData ? "Edit Expense" : "Log New Expense"}
          </h1>
        </div>
        <Button type="submit" disabled={loading} className="rounded-full px-6">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData ? "Save Changes" : "Record Expense"}
        </Button>
      </div>

      <Card className="glass-card border-white/5 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold ml-1">Description</Label>
              <Input placeholder="e.g. Office Stationery" {...register("description")} className="h-11" />
              {errors.description && <p className="text-red-400 text-[10px] font-bold mt-1">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold ml-1">Amount (MVR)</Label>
              <Input type="number" step="0.01" {...register("amount")} className="h-11" />
              {errors.amount && <p className="text-red-400 text-[10px] font-bold mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold ml-1">Date</Label>
              <Input type="date" {...register("date")} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold ml-1">Category</Label>
              <Select value={watch("category")} onValueChange={v => setValue("category", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold ml-1">Payment Status</Label>
              <Select value={watch("status")} onValueChange={v => setValue("status", v as 'paid' | 'pending')}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-bold ml-1">Internal Notes (Optional)</Label>
            <Textarea placeholder="Any additional context..." {...register("notes")} className="min-h-[100px]" />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
