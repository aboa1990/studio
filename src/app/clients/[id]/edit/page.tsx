
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getClients } from "@/lib/store"
import { Client } from "@/lib/types"
import ClientForm from "@/components/clients/ClientForm"

export default function EditClientPage() {
  const { id } = useParams()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    const found = getClients().find(c => c.id === id)
    if (found) setClient(found)
  }, [id])

  if (!client) return <div className="p-20 text-center text-muted-foreground">Loading client...</div>

  return <ClientForm initialData={client} />
}
