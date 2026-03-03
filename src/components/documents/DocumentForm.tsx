
"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Trash2, Plus, Save, FileCheck, Upload, FileText, X, Users, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Document, LineItem, DocumentType, DocumentStatus, Attachment, Client, LibraryDocument } from "@/lib/types"
import { useRouter } from "next/navigation"
import { saveDocument, getClients, getLibraryDocuments, getActiveProfileId } from "@/lib/store"

interface DocumentFormProps {
  initialData?: Document;
  type: DocumentType;
}

export default function DocumentForm({ initialData, type }: DocumentFormProps) {
  const router = useRouter()
  const [savedClients, setSavedClients] = useState<Client[]>([])
  const [libraryDocs, setLibraryDocs] = useState<LibraryDocument[]>([])
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  
  const defaultTerms = type === 'tender' 
    ? "1. This proposal is valid for 90 days from the submission date.\n2. All prices are inclusive of GST.\n3. Delivery will be within the specified timeframe upon award."
    : type === 'boq'
    ? "1. Quantities are estimated and subject to site verification.\n2. Rates provided are valid for 30 days.\n3. All items are inclusive of labor and materials unless specified."
    : "1. Please pay within 14 days.\n2. Bank transfer is preferred.\n3. Include reference number as reference.";

  const [doc, setDoc] = useState<Partial<Document>>(
    initialData || {
      id: uuidv4(),
      profileId: '', // Will be set in useEffect
      type,
      number: `${type === 'invoice' ? 'INV' : type === 'tender' ? 'TDR' : type === 'boq' ? 'BOQ' : 'QT'}-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      items: [{ id: uuidv4(), description: "", quantity: 1, price: 0, costCode: "" }],
      taxRate: 6,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      currency: "MVR",
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      terms: defaultTerms,
      attachments: []
    }
  )

  useEffect(() => {
    const fetchData = async () => {
      const [clients, libraryDocuments, profileId] = await Promise.all([
        getClients(), 
        getLibraryDocuments(),
        !initialData ? getActiveProfileId() : Promise.resolve(null)
      ]);
      setSavedClients(clients);
      setLibraryDocs(libraryDocuments);
      if (profileId) {
        setActiveProfileId(profileId);
        setDoc(prev => ({ ...prev, profileId }));
      }
    }
    fetchData();
  }, [initialData])

  useEffect(() => {
    const subtotal = doc.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const taxAmount = subtotal * ((doc.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    setDoc(prev => ({ ...prev, subtotal, taxAmount, total }));
  }, [doc.items, doc.taxRate]);

  const handleClientSelect = (clientId: string) => {
    const client = savedClients.find(c => c.id === clientId)
    if (client) {
      setDoc(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: client.address
      }))
    }
  }

  const handleAddItem = () => {
    setDoc(prev => ({
      ...prev,
      items: [...(prev.items || []), { id: uuidv4(), description: "", quantity: 1, price: 0, costCode: "" }]
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: Attachment = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          data: reader.result as string
        };
        setDoc(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addFromLibrary = (libDoc: LibraryDocument) => {
    const alreadyExists = doc.attachments?.some(a => a.name === libDoc.name);
    if (alreadyExists) return;

    const newAttachment: Attachment = {
      id: uuidv4(),
      name: libDoc.name,
      type: libDoc.type,
      data: libDoc.data
    };
    setDoc(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), newAttachment]
    }));
  }

  const removeAttachment = (id: string) => {
    setDoc(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(a => a.id !== id) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (doc.items && doc.items.length > 0 && doc.profileId) {
      setLoading(true);
      await saveDocument(doc as Document);
      setLoading(false);
      router.push(type === 'invoice' ? '/invoices' : type === 'tender' ? '/tenders' : type === 'boq' ? '/boqs' : '/quotations');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          {initialData ? `Edit ${type.toUpperCase()}` : `New ${type.toUpperCase()}`}
        </h1>
        <div className="flex gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground" disabled={loading}>
            {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" />Save {type.toUpperCase()}</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Information</CardTitle>
            {savedClients.length > 0 && (
              <Select onValueChange={handleClientSelect}>
                <SelectTrigger className="w-[200px] h-8 text-xs bg-muted">
                  <Users className="size-3 mr-2" />
                  <SelectValue placeholder="Select Saved Client" />
                </SelectTrigger>
                <SelectContent>
                  {savedClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client / Agency Name</Label>
              <Input
                id="client-name"
                placeholder="Name of customer or agency"
                value={doc.clientName}
                onChange={e => setDoc(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">Contact Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="email@example.com"
                  value={doc.clientEmail}
                  onChange={e => setDoc(prev => ({ ...prev, clientEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-date">Document Date</Label>
                <Input
                  id="doc-date"
                  type="date"
                  value={doc.date}
                  onChange={e => setDoc(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-address">Billing Address</Label>
              <Textarea
                id="client-address"
                placeholder="Client Address"
                value={doc.clientAddress}
                onChange={e => setDoc(prev => ({ ...prev, clientAddress: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-number">Reference Number</Label>
              <Input
                id="doc-number"
                value={doc.number}
                onChange={e => setDoc(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>

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
                  {(type === 'tender' || type === 'boq') && (
                    <>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="awarded">Awarded</SelectItem>
                    </>
                  )}
                  {type === 'invoice' && <SelectItem value="paid">Paid</SelectItem>}
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
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
              <Label htmlFor="due-date">Submission/Due Date</Label>
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
          <CardTitle>{type === 'boq' ? 'Pricing Items' : 'Quantities / Line Items'}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doc.items?.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                {type === 'boq' && (
                  <div className="col-span-2 space-y-2">
                    <Label>Cost Code</Label>
                    <Input
                      placeholder="e.g. 1.1"
                      value={item.costCode || ""}
                      onChange={e => handleItemChange(item.id, 'costCode', e.target.value)}
                    />
                  </div>
                )}
                <div className={type === 'boq' ? "col-span-4 space-y-2" : "col-span-6 space-y-2"}>
                  <Label>Description / Element</Label>
                  <Input
                    placeholder="Description of work"
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
                  <Label>Rate ({doc.currency})</Label>
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
                <span>Total Value:</span>
                <span className="text-primary">{doc.currency} {doc.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(type === 'tender' || type === 'boq') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" /> Supporting Documents
            </CardTitle>
            <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <BookOpen className="size-4 mr-2" /> Library
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select from Library</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-[400px] overflow-y-auto py-4">
                  {libraryDocs.map(libDoc => (
                    <div 
                      key={libDoc.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        addFromLibrary(libDoc);
                        setIsLibraryOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="size-4 text-primary shrink-0" />
                        <span className="text-sm truncate font-medium">{libDoc.name}</span>
                      </div>
                      <Plus className="size-4 text-muted-foreground" />
                    </div>
                  ))}
                  {libraryDocs.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p className="text-sm">Library is empty.</p>
                      <p className="text-xs">Add files in the "Doc Library" section.</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsLibraryOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {doc.attachments?.map((attachment) => (
                <div key={attachment.id} className="p-3 border rounded-lg bg-muted/50 flex items-center justify-between group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{attachment.name}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="size-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
              <Label htmlFor="doc-files" className="cursor-pointer border-2 border-dashed rounded-lg p-3 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <Upload className="size-4" />
                <span className="text-xs">Add Files</span>
                <input 
                  id="doc-files" 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-terms">Terms & Conditions</Label>
            <Textarea
              id="doc-terms"
              placeholder="Enter specific conditions..."
              value={doc.terms}
              onChange={e => setDoc(prev => ({ ...prev, terms: e.target.value }))}
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc-notes">Internal Notes</Label>
            <Textarea
              id="doc-notes"
              placeholder="Add internal reminders..."
              value={doc.notes}
              onChange={e => setDoc(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
