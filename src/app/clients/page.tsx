
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Users } from "lucide-react"
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
import { useStore } from "@/lib/store"
import { Client } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ClientsList() {
  const { toast } = useToast()
  const router = useRouter()
  const { currentProfile } = useStore()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentProfile) {
      const fetchClients = async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('profile_id', currentProfile.id)

        if (error) {
          console.error("Error fetching clients:", error)
          toast({
            title: "Error fetching clients",
            description: "Could not fetch your client list. Please try again.",
            variant: "destructive",
          })
        } else {
          setClients(data)
        }
        setLoading(false)
      }
      fetchClients()
    }
  }, [currentProfile, toast])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) {
        toast({
          title: "Error deleting client",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setClients(prev => prev.filter(c => c.id !== id))
        toast({
          title: "Client Deleted",
          description: "The client has been removed successfully.",
        })
      }
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Clients</h1>
          <p className="text-muted-foreground text-lg">Your central hub for all client information.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-xl shadow-primary/10">
          <Link href="/clients/new"><Plus className="mr-2 size-4" /> New Client</Link>
        </Button>
      </div>

      <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
        <CardHeader className="border-b border-white/5 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>A complete list of all your clients.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
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
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Name</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Contact</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Phone</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] h-14">Primary Contact</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase tracking-[0.2em] h-14 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">Loading clients...</TableCell>
                </TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-white/5">
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.contact_person}</TableCell>
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
                            <Link href={`/clients/${client.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Client</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                   <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="size-12 opacity-10" />
                      <p className="font-semibold">No clients found</p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/clients/new">Add Your First Client</Link>
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
