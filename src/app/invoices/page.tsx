
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, ArrowUpRight, FileText } from "lucide-react"
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
import { getDocuments, deleteDocument } from "@/lib/store"
import { Document } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function InvoicesList() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<Document[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const documents = await getDocuments();
      setDocs(documents.filter(d => d.type === 'invoice'));
      setLoading(false);
    };
    fetchDocuments();
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been removed successfully.",
      });
    }
  }

  const filteredDocs = docs.filter(d => 
    d.clientName.toLowerCase().includes(search.toLowerCase()) || 
    d.number.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Invoices</h1>
          <p className="text-muted-foreground text-lg">Manage and track your customer billing lifecycle.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-xl shadow-primary/10">
          <Link href="/invoices/new"><Plus className="mr-2 size-4" /> New Invoice</Link>
        </Button>
      </div>

      <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
        <CardHeader className="border-b border-white/5 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Invoice Records</CardTitle>
              <CardDescription>A list of all your generated invoices.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search by client or reference..." 
                className="pl-10 h-10 rounded-xl bg-white/5 border-white/5 focus:bg-white/10 transition-all" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Reference</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Client</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Issued On</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Total Amount</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Status</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] h-14 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    Loading your invoices...
                  </TableCell>
                </TableRow>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="py-5">
                      <Link href={`/invoices/${doc.id}`} className="font-black text-white group-hover:underline underline-offset-4 flex items-center gap-2">
                        {doc.number} <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{doc.clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(doc.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="font-black">MVR {doc.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card w-48 rounded-xl shadow-2xl">
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 p-3 rounded-lg">
                            <Link href={`/invoices/${doc.id}`} className="flex items-center"><Eye className="mr-3 h-4 w-4" /> View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 p-3 rounded-lg">
                            <Link href={`/invoices/${doc.id}/edit`} className="flex items-center"><Edit className="mr-3 h-4 w-4" /> Edit Record</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 p-3 rounded-lg cursor-pointer" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="mr-3 h-4 w-4" /> Delete Permanently
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
                      <FileText className="size-12 opacity-10" />
                      <p className="font-semibold">No invoices found.</p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/invoices/new">Create First Invoice</Link>
                      </Button>
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
