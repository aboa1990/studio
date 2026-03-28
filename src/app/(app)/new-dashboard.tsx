
"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { TrendingUp, Plus, FileText, Users, Wallet, ArrowUpRight, ArrowDownRight, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { useStore, getDocuments, getClients, getExpenses } from '@/lib/store';
import { Document, Client, Expense } from '@/lib/types';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
        <p className="label font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{`${label}`}</p>
        <div className="space-y-1">
          <p className="text-emerald-400 text-xs font-black">{`Revenue: MVR ${payload[0].value.toLocaleString()}`}</p>
          {payload[1] && <p className="text-red-400 text-xs font-black">{`Expenses: MVR ${payload[1].value.toLocaleString()}`}</p>}
        </div>
      </div>
    );
  }
  return null;
};

export default function NewDashboard() {
  const { currentProfile } = useStore();
  const [invoices, setInvoices] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (currentProfile) {
      fetchData();
    }
  }, [currentProfile]);

  const fetchData = async () => {
    const [invoiceData, clientData, expenseData] = await Promise.all([
      getDocuments('invoice'),
      getClients(),
      getExpenses()
    ]);
    setInvoices(invoiceData);
    setClients(clientData);
    setExpenses(expenseData);
    prepareChartData(invoiceData, expenseData);
  };

  const prepareChartData = (invoices: Document[], expenses: Expense[]) => {
    const dateRange = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();
    const data = dateRange.map(date => {
      const formattedDate = format(date, 'MMM d');
      const dailyRevenue = invoices
        .filter(inv => inv.status === 'paid' && format(new Date(inv.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      const dailyExpenses = expenses
        .filter(exp => format(new Date(exp.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);
      return { date: formattedDate, revenue: dailyRevenue, expense: dailyExpenses };
    });
    setChartData(data);
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const totalClients = clients.length;
  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            Welcome back, {currentProfile?.name || 'User'}. Here's your business snapshot.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full px-6 h-10 text-sm font-bold tracking-tight shadow-lg transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 size-4" /> New Document
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-bold">
              <DropdownMenuItem asChild><Link href="/invoices/new">Invoice</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/quotations/new">Quotation</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/expenses/new">Expense Record</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/boqs/new">BOQ</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-white/5 bg-emerald-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Total Revenue</CardTitle>
            <ArrowUpRight className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">MVR {totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Confirmed payments</p>
          </CardContent>
        </Card>
        
        <Card className="border-white/5 bg-red-500/[0.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Total Expenses</CardTitle>
            <ArrowDownRight className="size-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">MVR {totalExpenses.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Business outgoings</p>
          </CardContent>
        </Card>

        <Card className={cn("border-white/5", netProfit >= 0 ? "bg-primary/5" : "bg-destructive/5")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Net Profit</CardTitle>
            <Calculator className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-black", netProfit >= 0 ? "text-primary" : "text-destructive")}>
              MVR {netProfit.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Earnings after expenses</p>
          </CardContent>
        </Card>

        <Card className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Client Base</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{totalClients}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active business entities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Financial Performance</CardTitle>
            <CardDescription className="text-xs">Last 30 days revenue vs expenses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `MVR ${value > 999 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f87171" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Recent Billing</CardTitle>
            <CardDescription className="text-xs">Your latest 5 invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {recentInvoices.length > 0 ? (
              recentInvoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Link href={`/invoices/${invoice.id}`} className="text-xs font-black hover:underline tracking-tight">{invoice.number}</Link>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">{invoice.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black">MVR {invoice.total?.toLocaleString()}</p>
                    <Badge variant={
                        invoice.status === 'paid' ? 'default' :
                        invoice.status === 'sent' ? 'secondary' :
                        'outline'
                    } className="text-[8px] px-1.5 py-0 h-3.5 uppercase font-bold tracking-widest mt-1">{invoice.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="size-8 mx-auto mb-3 opacity-10" />
                <p className="text-[10px] uppercase font-bold tracking-widest">No recent records</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
