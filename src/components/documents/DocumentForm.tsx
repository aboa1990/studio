
"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Trash2, Plus, Save, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Document, LineItem, DocumentType, DocumentStatus } from "@/lib/types"
import { useRouter } from "next/navigation"
import { saveDocument, getActiveProfileId } from "@/lib/store"

interface DocumentFormProps {
  initialData?: Document;
  type: DocumentType;
}

export default function DocumentForm({ initialData, type }: DocumentFormProps) {
  const router = useRouter()
  const activeProfileId = getActiveProfileId()
  
  const [doc, setDoc] = useState<Partial<Document>>(
    initialData || {
      id: uuidv4(),
      profileId: activeProfileId,
      type,
      number: `${type === 'invoice' ? 'INV' : 'QT'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      clientName: "",
      clientEmail: "",
      items: [{ id: uuidv4(), description: "", quantity: 1, price: 0 }],
      taxRate: 6,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      currency: "MVR",
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      terms: "1. Please pay within 14 days.\n2. Bank transfer is preferred.\n3. Include invoice number as reference.",
    }
  )

  useEffect(() => {
    const subtotal = doc.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const taxAmount = subtotal * ((doc.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    setDoc(prev => ({ ...prev, subtotal, taxAmount, total }));
  }, [doc.items, doc.taxRate]);

  const handleAddItem = () => {
    setDoc(prev => ({
      ...prev,
      items: [...(prev.items || []), { id: uuidv4(), description: "", quantity: 1, price: 0 }]
    }));
  }

  const handleRemoveItem = (id: string) => {
    setDoc(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== id) || []
    }));
  }

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setDoc(prev => ({
      ...prev,
      items: prev.items?.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doc.items && doc.items.length > 0) {
      saveDocument(doc as Document);
      router.push(type === 'invoice' ? '/invoices' : '/quotations');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          {initialData ? `Edit ${type}` : `New ${type}`}
        </h1>
        <div className="flex gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />
            Save {type}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-number">Reference Number</Label>
                <Input
                  id="doc-number"
                  value={doc.number}
                  onChange={e => setDoc(prev => ({ ...prev, number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-date">Date</Label>
                <Input
                  id="doc-date"
                  type="date"
                  value={doc.date}
                  onChange={e => setDoc(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="ABC Maldives Pvt Ltd"
                value={doc.clientName}
                onChange={e => setDoc(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">Client Email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="finance@client.mv"
                value={doc.clientEmail}
                onChange={e => setDoc(prev => ({ ...prev, clientEmail: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={doc.status}
                onValueChange={(val: DocumentStatus) => setDoc(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  {type === 'invoice' && <SelectItem value="paid">Paid</SelectItem>}
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate">GST Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={doc.taxRate}
                onChange={e => setDoc(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={doc.dueDate}
                onChange={e => setDoc(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doc.items?.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                <div className="col-span-6 space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Services or goods description"
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Price ({doc.currency})</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={e => handleItemChange(item.id, 'price', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={doc.items?.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{doc.currency} {doc.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">GST ({doc.taxRate}%):</span>
                <span className="font-medium">{doc.currency} {doc.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{doc.currency} {doc.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-terms">Terms & Conditions</Label>
            <Textarea
              id="doc-terms"
              placeholder="Enter payment terms or other conditions..."
              value={doc.terms}
              onChange={e => setDoc(prev => ({ ...prev, terms: e.target.value }))}
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-notes">Internal Notes (Not visible on document)</Label>
            <Textarea
              id="doc-notes"
              placeholder="Add internal reminders or details..."
              value={doc.notes}
              onChange={e => setDoc(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
