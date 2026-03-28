
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, FileSignature } from "lucide-react"
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

export default function AgreementsList() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<Document[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const documents = await getDocuments('agreement');
      setDocs(documents);
      setLoading(false);
    };
    fetchDocuments();
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this agreement record?")) {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Agreement Deleted",
        description: "The record has been removed successfully.",
      });
    }
  }

  const filteredDocs = docs.filter(d => 
    d.clientName.toLowerCase().includes(search.toLowerCase()) || 
    d.number.toLowerCase().includes(search.toLowerCase()) ||
    (d.terms && d.terms.toLowerCase().includes(search.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'expired': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-white/50 border-white/10'; // draft
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Agreements</h1>
          <p className="text-muted-foreground text-base">Legal contracts, project terms, and tenancy agreements.</p>
        </div>
        <Button asChild className="rounded-full px-5 h-9 text-xs font-bold">
          <Link href="/agreements/new"><Plus className="mr-2 size-3.5" /> New Agreement</Link>
        </Button>
      </div>

      <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
         <CardHeader className="border-b border-white/5 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Contract Registry</CardTitle>
              <CardDescription className="text-xs">A repository of all legal documents and project agreements.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search contracts..." 
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
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Reference</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Agreement Title</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Parties</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Effective Date</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Status</TableHead>
                <TableHead className="text-right font-bold text-[9px] uppercase tracking-[0.2em] pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-xs">Loading agreements...</TableCell>
                </TableRow>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="border-white/5 text-xs">
                    <TableCell className="font-bold">
                      <Link href={`/agreements/${doc.id}`} className="hover:underline text-primary">
                        {doc.number}
                      </Link>
                    </TableCell>
                    <TableCell className="font-black truncate max-w-[200px]">{doc.terms}</TableCell>
                    <TableCell>{doc.clientName}</TableCell>
                    <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] uppercase h-4 ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/agreements/${doc.id}`}><Eye className="mr-2 h-3.5 w-3.5" /> View Detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/agreements/${doc.id}/edit`}><Edit className="mr-2 h-3.5 w-3.5" /> Edit Text</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(doc.id)}>
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
                      <FileSignature className="size-8 opacity-10" />
                      <p className="font-semibold text-sm">No agreements found</p>
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
