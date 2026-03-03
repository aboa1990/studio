
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail, Phone, Loader2, AlertTriangle } from "lucide-react"
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
import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { Client } from "@/lib/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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
          .eq('profileId', currentProfile.id)

        if (error) {
          console.error("Error fetching clients:", error)
          toast({ title: "Error", description: "Failed to fetch clients.", variant: "destructive" })
        } else {
          setClients(data || [])
        }
        setLoading(false)
      }
      fetchClients()
    } else {
        // If there's no profile selected after the store has been checked
        setLoading(false);
        setClients([]);
    }
  }, [currentProfile, toast])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      const { error } = await supabase.from('clients').delete().eq('id', id)

      if (error) {
        console.error("Error deleting client:", error)
        toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" })
      } else {
        setClients(prev => prev.filter(c => c.id !== id))
        toast({
          title: "Client Deleted",
          description: "The client has been removed from your database.",
        })
      }
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.contactPerson && c.contactPerson.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-black tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database and contact info.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/clients/new"><Plus className="mr-2 size-4" /> Add Client</Link>
        </Button>
      </div>
      
      {!currentProfile && !loading && (
          <div className="flex flex-col items-center justify-center h-96 gap-4 text-center p-8 border-2 border-dashed rounded-lg border-amber-500/50 bg-amber-500/5">
            <AlertTriangle className="size-12 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-500">No Company Profile Selected</h2>
            <p className="text-muted-foreground max-w-sm">
              Please create or select a company profile from the sidebar to manage clients.
            </p>
            <Button onClick={() => router.push('/settings')} className="mt-4">
              Go to Settings
            </Button>
          </div>
      )}

      {currentProfile && (
        <Card className="border-none shadow-lg bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border bg-card/80">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients..." 
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin"/>
                        <span>Loading clients...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contactPerson || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="size-3 text-muted-foreground" /> {client.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="size-3 text-muted-foreground" /> {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.gstNumber || 'N/A'}</TableCell>
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
                              <Link href={`/clients/${client.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(client.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No clients found. Add your first client to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
