
"use client"

import { useEffect, useState } from "react"
import { 
  FileText, 
  Quote, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  
  const totalInvoiced = invoices.reduce((sum, doc) => sum + doc.total, 0)
  const pendingInvoiced = invoices.filter(i => i.status !== 'paid').reduce((sum, doc) => sum + doc.total, 0)
  const quotationValue = quotations.reduce((sum, doc) => sum + doc.total, 0)

  const chartData = [
    { name: 'Invoiced', value: totalInvoiced, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: pendingInvoiced, color: 'hsl(var(--accent))' },
    { name: 'Quotations', value: quotationValue, color: 'hsl(var(--muted-foreground))' },
  ]

  const stats = [
    {
      label: "Total Revenue",
      value: `MVR ${totalInvoiced.toLocaleString()}`,
      icon: TrendingUp,
      desc: "Gross invoiced amount",
      color: "text-primary"
    },
    {
      label: "Pending Payments",
      value: `MVR ${pendingInvoiced.toLocaleString()}`,
      icon: Clock,
      desc: "Awaiting client action",
      color: "text-accent"
    },
    {
      label: "Open Quotes",
      value: `MVR ${quotationValue.toLocaleString()}`,
      icon: Quote,
      desc: "Potential revenue",
      color: "text-muted-foreground"
    },
    {
      label: "Overdue",
      value: `${invoices.filter(i => i.status === 'overdue').length}`,
      icon: AlertCircle,
      desc: "Urgent follow-ups",
      color: "text-destructive"
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your Maldivian business at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/invoices/new"><Plus className="mr-2 size-4" /> New Invoice</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`size-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {docs.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-4">
                  <div className={`size-10 rounded-full flex items-center justify-center ${doc.type === 'invoice' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {doc.type === 'invoice' ? <FileText size={18} /> : <Quote size={18} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{doc.clientName}</p>
                    <p className="text-xs text-muted-foreground">{doc.number} • {new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm font-bold">
                    MVR {doc.total.toLocaleString()}
                  </div>
                </div>
              ))}
              {docs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto size-12 opacity-10 mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
