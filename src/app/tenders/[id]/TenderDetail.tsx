
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDocument, saveDocument } from "@/lib/store"
import { Document, Attachment } from "@/lib/types"
import DocumentPreview from "@/components/documents/DocumentPreview"
import EmailComposer from "@/components/documents/EmailComposer"
import { ChevronLeft, FilePlus, Loader2, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TenderDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      const found = await getDocument(id as string, 'tender');
      if (found) setDoc(found);
      setLoading(false);
    };

    if(id) fetchDocument();
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
        attachments: [] // Don't copy attachments to invoice usually
      };

      await saveDocument(newInvoice);
      
      toast({
        title: "Tender Awarded",
        description: `New invoice ${invoiceNumber} has been created from this tender.`,
      });

      router.push(`/invoices/${invoiceId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert tender to invoice.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAttachment = (attachment: Attachment) => {
    const link = window.document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    link.click();
  }

  if (loading) return <div className="p-20 text-center text-muted-foreground">Loading...</div>;
  if (!doc) return <div className="p-20 text-center text-muted-foreground">Tender not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {doc.status === 'awarded' && (
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
              Create Invoice
            </Button>
          )}
          <EmailComposer document={doc} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <DocumentPreview data={doc} />
        </div>
        
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Bid Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doc.attachments && doc.attachments.length > 0 ? (
                  doc.attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="size-4 text-primary shrink-0" />
                        <span className="text-xs truncate">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7" onClick={() => downloadAttachment(file)}>
                        <Download className="size-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No attachments uploaded.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg">Tender Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Current Status:</span>
                <span className="font-bold uppercase tracking-wider">{doc.status}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Submission Deadline:</span>
                <span className="font-medium">{doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : 'Not set'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
