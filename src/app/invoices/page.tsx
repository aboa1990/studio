
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, FileText } from "lucide-react"
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
      const documents = await getDocuments('invoice');
      setDocs(documents);
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
      case 'paid': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'overdue': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'; // draft
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
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">Loading invoices...</TableCell>
                </TableRow>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="border-white/5">
                    <TableCell className="font-medium">
                      <Link href={`/invoices/${doc.id}`} className="hover:underline text-primary">
                        {doc.number}
                      </Link>
                    </TableCell>
                    <TableCell>{doc.clientName}</TableCell>
                    <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                    <TableCell>MVR {doc.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${doc.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${doc.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                      <p className="font-semibold">No invoices found</p>
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
