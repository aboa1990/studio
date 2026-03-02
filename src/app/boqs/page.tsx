
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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

export default function BOQsList() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<Document[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      const documents = await getDocuments();
      setDocs(documents.filter(d => d.type === 'boq'));
      setLoading(false);
    };
    fetchDocuments();
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this BOQ?")) {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast({
        title: "BOQ Deleted",
        description: "The BOQ record has been removed.",
      });
    }
  }

  const filteredDocs = docs.filter(d => 
    d.clientName.toLowerCase().includes(search.toLowerCase()) || 
    d.number.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'awarded': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-black tracking-tight">Bill of Quantities</h1>
          <p className="text-muted-foreground mt-1">Manage project quantities and rates.</p>
        </div>
        <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Link href="/boqs/new"><Plus className="mr-2 size-4" /> New BOQ</Link>
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search by client or number..." 
              className="pl-10" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>BOQ #</TableHead>
                <TableHead>Client/Agency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Estimated Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Loading BOQs...
                  </TableCell>
                </TableRow>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="group transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`/boqs/${doc.id}`} className="text-indigo-500 hover:underline underline-offset-4">
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/boqs/${doc.id}`}><Eye className="mr-2 h-4 w-4" /> View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/boqs/${doc.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit BOQ</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No BOQs found.
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
