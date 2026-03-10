
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getClients } from "@/lib/store"
import { Client } from "@/lib/types"
import ClientForm from "@/components/clients/ClientForm"

export default function EditClientForm() {
  const { id } = useParams()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    const fetchClient = async () => {
      const clients = await getClients();
      const found = clients.find(c => c.id === id)
      if (found) setClient(found)
    }
    fetchClient();
  }, [id])

  if (!client) return <div className="p-20 text-center text-muted-foreground">Loading client...</div>

  return <ClientForm initialData={client} />
}
