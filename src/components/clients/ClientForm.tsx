
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Save, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Client } from "@/lib/types"
import { saveClient, getActiveProfileId } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface ClientFormProps {
  initialData?: Client;
}

export default function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const activeProfileId = getActiveProfileId()

  const [formData, setFormData] = useState<Client>(
    initialData || {
      id: uuidv4(),
      profileId: activeProfileId,
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      notes: ""
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveClient(formData)
    toast({
      title: initialData ? "Client Updated" : "Client Created",
      description: `${formData.name} has been saved successfully.`,
    })
    router.push("/clients")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-3xl font-headline font-bold">
          {initialData ? "Edit Client" : "New Client"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Company / Client Name</Label>
                <Input
                  id="client-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">Contact Person (Optional)</Label>
                <Input
                  id="contact-person"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">Email Address</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Phone Number</Label>
                <Input
                  id="client-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-gst">GST Number (Optional)</Label>
              <Input
                id="client-gst"
                placeholder="GST-XXXXX-XXXX"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-address">Billing Address</Label>
              <Textarea
                id="client-address"
                className="min-h-[100px]"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-notes">Internal Notes</Label>
              <Textarea
                id="client-notes"
                placeholder="Special requirements, account history, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground">
            <Save className="mr-2 h-4 w-4" /> Save Client
          </Button>
        </div>
      </form>
    </div>
  )
}
