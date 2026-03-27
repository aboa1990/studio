"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users } from "lucide-react"
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
import { useStore, getClients } from "@/lib/store"
import { Client } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { doc, deleteDoc } from "firebase/firestore"
import { initializeFirebase } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const { firestore } = initializeFirebase();

export default function ClientsList() {
  const { toast } = useToast()
  const { currentProfile } = useStore()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentProfile) {
      const fetchClients = async () => {
        setLoading(true)
        const data = await getClients();
        setClients(data);
        setLoading(false)
      }
      fetchClients()
    }
  }, [currentProfile])

  const handleDelete = async (id: string) => {
    if (!currentProfile) return;
    if (confirm("Are you sure?")) {
      const docRef = doc(firestore, 'companies', currentProfile.id, 'clients', id);
      deleteDoc(docRef)
        .then(() => {
          setClients(prev => prev.filter(c => c.id !== id))
          toast({ title: "Client Deleted" })
        })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete'
          }));
        });
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Your central hub for client information.</p>
        </div>
        <Button asChild className="rounded-full px-5 h-9 text-xs font-bold">
          <Link href="/clients/new"><Plus className="mr-2 size-3.5" /> New Client</Link>
        </Button>
      </div>

      <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
        <CardHeader className="border-b border-white/5 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Client Directory</CardTitle>
              <CardDescription className="text-xs">A list of all your clients.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
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
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Name</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Contact</TableHead>
                <TableHead className="font-bold text-[9px] uppercase tracking-[0.2em]">Phone</TableHead>
                <TableHead className="text-right font-bold text-[9px] uppercase tracking-[0.2em] pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-48 text-center text-xs">Loading clients...</TableCell></TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-white/5 text-xs">
                    <TableCell className="font-bold">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}/edit`}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="size-8 opacity-10" />
                      <p className="font-semibold text-sm">No clients found</p>
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
