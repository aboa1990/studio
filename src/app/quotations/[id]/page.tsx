
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDocuments, saveDocument } from "@/lib/store"
import { Document } from "@/lib/types"
import DocumentPreview from "@/components/documents/DocumentPreview"
import EmailComposer from "@/components/documents/EmailComposer"
import { ChevronLeft, FilePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

export default function QuotationDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [doc, setDoc] = useState<Document | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    const found = getDocuments().find(d => d.id === id);
    if (found) setDoc(found);
  }, [id]);

  const handleConvertToInvoice = async () => {
    if (!doc) return;
    
    setIsConverting(true);
    try {
      const invoiceId = uuidv4();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      
      const newInvoice: Document = {
        ...doc,
        id: invoiceId,
        type: 'invoice',
        number: invoiceNumber,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      saveDocument(newInvoice);
      
      toast({
        title: "Quotation Converted",
        description: `New invoice ${invoiceNumber} has been created.`,
      });

      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert quotation to invoice.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (!doc) return <div className="p-20 text-center text-muted-foreground">Quotation not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none border-primary text-primary hover:bg-primary/10"
            onClick={handleConvertToInvoice}
            disabled={isConverting}
          >
            {isConverting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilePlus className="mr-2 h-4 w-4" />
            )}
            Convert to Invoice
          </Button>
          <EmailComposer document={doc} />
        </div>
      </div>
      
      <DocumentPreview data={doc} />
    </div>
  )
}
