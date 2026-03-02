
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
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/dashboard/Chart'), { ssr: false });

export default function Dashboard() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const documents = await getDocuments();
      setDocs(documents);
      setLoading(false);
    };
    fetchDocuments();
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
    { name: 'Quotations', value: quotationValue, color: 'hsl(48 96% 53%)' },
    { name: 'Tenders', value: tenderValue, color: 'hsl(142 71% 45%)' },
    { name: 'BOQs', value: boqValue, color: 'hsl(221 83% 53%)' },
  ]

  const stats = [
    {
      label: "Revenue",
      value: `MVR ${totalInvoiced.toLocaleString()}`,
      icon: TrendingUp,
      desc: "Gross invoiced amount",
      color: "text-white",
      bg: "bg-white/10"
    },
    {
      label: "Active BOQs",
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
      desc: "Active contract value",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      label: "Quotations",
      value: `MVR ${quotationValue.toLocaleString()}`,
      icon: Quote,
      desc: "Client proposals",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ]

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/30">
            Overview
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Your business performance and metrics.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild className="rounded-full px-8 h-12 text-base font-black tracking-tight shadow-2xl shadow-white/5 transition-all hover:scale-105 active:scale-95">
            <Link href="/invoices/new"><Plus className="mr-2 size-5" /> New Invoice</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden group hover:bg-white/[0.05] transition-all duration-500 rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-8 px-8">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</CardTitle>
              <div className={`p-3 rounded-[1.2rem] ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="size-5" />
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="text-3xl font-black tracking-tight text-white mb-2">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-60">
                <ArrowUpRight className="size-3" /> {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card rounded-[2.5rem] p-4">
          <CardHeader className="px-6 py-6">
            <CardTitle className="text-xl font-black">Financial Performance</CardTitle>
            <CardDescription className="text-muted-foreground">Estimated value distribution across documents.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <Chart data={chartData} />
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[2.5rem] p-4">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-6">
            <div>
              <CardTitle className="text-xl font-black">Latest Activity</CardTitle>
              <CardDescription>Recent generated records</CardDescription>
            </div>
            <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center">
               <Calendar className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-3">
              {loading ? (
                 <div className="text-center py-24 text-muted-foreground">Loading...</div>
              ) : docs.length > 0 ? (
                docs.slice(0, 5).map((doc) => (
                  <Link 
                    key={doc.id} 
                    href={`/${doc.type}s/${doc.id}`}
                    className="flex items-center gap-4 group p-4 rounded-[1.5rem] hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5"
                  >
                    <div className={`size-12 rounded-[1rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      doc.type === 'invoice' ? 'bg-white/5 text-white' : 
                      doc.type === 'tender' ? 'bg-emerald-500/10 text-emerald-400' :
                      doc.type === 'boq' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {doc.type === 'invoice' ? <FileText size={22} /> : 
                       doc.type === 'tender' ? <Briefcase size={22} /> : 
                       doc.type === 'boq' ? <ClipboardList size={22} /> : 
                       <Quote size={22} />}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-black truncate group-hover:text-primary transition-colors">{doc.clientName}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em]">{doc.number} • {new Date(doc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <div className="text-sm font-black text-white text-right whitespace-nowrap">
                      {doc.total.toLocaleString()}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-24 text-muted-foreground space-y-4">
                  <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 opacity-20">
                    <FileText className="size-10" />
                  </div>
                  <p className="font-bold text-lg">No documents yet</p>
                  <Button variant="link" asChild size="sm" className="font-bold text-white uppercase tracking-widest text-[10px]">
                    <Link href="/invoices/new">Create first invoice</Link>
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
