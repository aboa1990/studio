
"use client"

import { useEffect, useState } from "react"
import { 
  FileText, 
  Quote, 
  TrendingUp, 
  Plus,
  Briefcase,
  ClipboardList,
  ArrowUpRight,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDocuments } from "@/lib/store"
import { Document } from "@/lib/types"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts"

export default function Dashboard() {
  const [docs, setDocs] = useState<Document[]>([])
  
  useEffect(() => {
    setDocs(getDocuments())
  }, [])

  const invoices = docs.filter(d => d.type === 'invoice')
  const quotations = docs.filter(d => d.type === 'quotation')
  const tenders = docs.filter(d => d.type === 'tender')
  const boqs = docs.filter(d => d.type === 'boq')
  
  const totalInvoiced = invoices.reduce((sum, doc) => sum + doc.total, 0)
  const quotationValue = quotations.reduce((sum, doc) => sum + doc.total, 0)
  const tenderValue = tenders.reduce((sum, doc) => sum + doc.total, 0)
  const boqValue = boqs.reduce((sum, doc) => sum + doc.total, 0)

  const chartData = [
    { name: 'Invoiced', value: totalInvoiced, color: 'hsl(210 40% 98%)' },
    { name: 'Quotations', value: quotationValue, color: 'hsl(215 16% 57%)' },
    { name: 'Tenders', value: tenderValue, color: 'hsl(142 71% 45%)' },
    { name: 'BOQs', value: boqValue, color: 'hsl(221 83% 53%)' },
  ]

  const stats = [
    {
      label: "Total Revenue",
      value: `MVR ${totalInvoiced.toLocaleString()}`,
      icon: TrendingUp,
      desc: "Gross invoiced amount",
      color: "text-white",
      bg: "bg-white/10"
    },
    {
      label: "Open BOQs",
      value: `MVR ${boqValue.toLocaleString()}`,
      icon: ClipboardList,
      desc: "Estimated quantities",
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      label: "Bids & Tenders",
      value: `MVR ${tenderValue.toLocaleString()}`,
      icon: Briefcase,
      desc: "Estimated contract value",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      label: "Quotations",
      value: `MVR ${quotationValue.toLocaleString()}`,
      icon: Quote,
      desc: "Active client proposals",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
            Overview
          </h1>
          <p className="text-muted-foreground text-lg">Your business metrics at a glance.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="rounded-full px-6 shadow-xl shadow-primary/10">
            <Link href="/invoices/new"><Plus className="mr-2 size-4" /> Create Invoice</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 opacity-70">
                <ArrowUpRight className="size-3" /> {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
            <CardDescription>Estimated value across different document types</CardDescription>
          </CardHeader>
          <CardContent className="h-[380px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,15,0.95)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }} 
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest generated documents</CardDescription>
            </div>
            <Calendar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {docs.slice(0, 6).map((doc) => (
                <Link 
                  key={doc.id} 
                  href={`/${doc.type}s/${doc.id}`}
                  className="flex items-center gap-4 group p-3 -mx-3 rounded-xl hover:bg-white/[0.03] transition-all"
                >
                  <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    doc.type === 'invoice' ? 'bg-white/5 text-white' : 
                    doc.type === 'tender' ? 'bg-emerald-500/10 text-emerald-400' :
                    doc.type === 'boq' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {doc.type === 'invoice' ? <FileText size={20} /> : 
                     doc.type === 'tender' ? <Briefcase size={20} /> : 
                     doc.type === 'boq' ? <ClipboardList size={20} /> : 
                     <Quote size={20} />}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{doc.clientName}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{doc.number} • {new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm font-black text-right whitespace-nowrap">
                    {doc.total.toLocaleString()}
                  </div>
                </Link>
              ))}
              {docs.length === 0 && (
                <div className="text-center py-20 text-muted-foreground space-y-3">
                  <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="size-8 opacity-20" />
                  </div>
                  <p className="font-semibold">No documents yet</p>
                  <Button variant="link" asChild size="sm">
                    <Link href="/invoices/new">Create your first invoice</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
