
"use client"

import { useState } from "react"
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
import Link from "next/link"

export default function ClientsList() {
  const [search, setSearch] = useState("")

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
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No clients found. This feature is currently disabled.
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
