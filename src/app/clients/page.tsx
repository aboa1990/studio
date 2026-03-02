
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, User, MoreHorizontal, Edit, Trash2, Mail, Phone } from "lucide-react"
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
import { getClients, deleteClient } from "@/lib/store"
import { Client } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ClientsList() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    setClients(getClients())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(id)
      setClients(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Client Deleted",
        description: "The client record has been removed.",
      })
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
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
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <User className="size-4" />
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>{client.contactPerson || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground gap-1">
                      <div className="flex items-center gap-1"><Mail className="size-3" /> {client.email}</div>
                      <div className="flex items-center gap-1"><Phone className="size-3" /> {client.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{client.gstNumber || "N/A"}</TableCell>
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
                          <Link href={`/clients/${client.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No clients found.
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
