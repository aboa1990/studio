
"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, Plus, ArrowUpRight, FileText, Users, Clock, AlertCircle } from "lucide-react";
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
import { useStore, getDocuments, getClients } from '@/lib/store';
import { Document, Client } from '@/lib/types';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
        <p className="label font-bold text-xs">{`${label}`}</p>
        <p className="intro text-primary text-xs">{`Revenue: MVR ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function NewDashboard() {
  const { currentProfile } = useStore();
  const [invoices, setInvoices] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (currentProfile) {
      fetchData();
    }
  }, [currentProfile]);

  const fetchData = async () => {
    const [invoiceData, clientData] = await Promise.all([
      getDocuments('invoice'),
      getClients()
    ]);
    setInvoices(invoiceData);
    setClients(clientData);
    prepareChartData(invoiceData);
  };

  const prepareChartData = (invoices: Document[]) => {
    const dateRange = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();
    const data = dateRange.map(date => {
      const formattedDate = format(date, 'MMM d');
      const dailyRevenue = invoices
        .filter(inv => inv.status === 'paid' && format(new Date(inv.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      return { date: formattedDate, revenue: dailyRevenue };
    });
    setChartData(data);
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalClients = clients.length;
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;
  const overdueInvoices = invoices.filter(i => i.status === 'sent' && new Date(i.dueDate) < new Date()).length;
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
              <DropdownMenuItem asChild><Link href="/tenders/new">Tender</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/boqs/new">BOQ</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black">MVR {totalRevenue.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground">Based on paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clients</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black">{totalClients}</div>
            <p className="text-[10px] text-muted-foreground">Total active clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black">{pendingInvoices}</div>
            <p className="text-[10px] text-muted-foreground">Draft & Sent Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overdue</CardTitle>
            <AlertCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-destructive">{overdueInvoices}</div>
            <p className="text-[10px] text-muted-foreground">Invoices past due date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
            <CardDescription className="text-xs">Last 30 days performance</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `MVR ${value/1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <CardDescription className="text-xs">Your latest 5 invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvoices.length > 0 ? (
              recentInvoices.map(invoice => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-muted rounded-md">
                      <FileText className="size-3.5" />
                    </div>
                    <div>
                      <Link href={`/invoices/${invoice.id}`} className="text-sm font-semibold hover:underline">{invoice.number}</Link>
                      <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">MVR {invoice.total?.toFixed(2)}</p>
                    <Badge variant={
                        invoice.status === 'paid' ? 'default' :
                        invoice.status === 'sent' ? 'secondary' :
                        'outline'
                    } className="text-[10px] px-1.5 py-0 h-4 uppercase">{invoice.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="size-6 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No invoices yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
