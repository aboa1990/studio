
"use client";

import { 
  TrendingUp, 
  Plus,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton";

export default function Dashboard() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900/30">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Your business performance and metrics.</p>
        </div>
        <div className="flex gap-4">
          <LogoutButton />
          <Button asChild className="rounded-full px-8 h-12 text-base font-black tracking-tight shadow-2xl shadow-gray-900/5 transition-all hover:scale-105 active:scale-95">
            <Link href="/invoices/new"><Plus className="mr-2 size-5" /> New Invoice</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden group hover:bg-gray-50 transition-all duration-500 rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-8 px-8">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Revenue</CardTitle>
                <div className={`p-3 rounded-[1.2rem] bg-gray-900/10 text-gray-900 group-hover:scale-110 transition-transform`}>
                    <TrendingUp className="size-5" />
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="text-3xl font-black tracking-tight text-gray-900 mb-2">MVR 0</div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-60">
                    <ArrowUpRight className="size-3" /> Gross invoiced amount
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
