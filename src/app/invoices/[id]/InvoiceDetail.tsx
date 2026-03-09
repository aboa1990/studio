
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDocument } from "@/lib/store"
import { Document } from "@/lib/types"
import DocumentPreview from "@/components/documents/DocumentPreview"
import EmailComposer from "@/components/documents/EmailComposer"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvoiceDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      const found = await getDocument(id as string, 'invoice');
      if (found) setDoc(found);
      setLoading(false);
    };

    if(id) fetchDocument();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-muted-foreground">Loading...</div>;
  if (!doc) return <div className="p-20 text-center text-muted-foreground">Invoice not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
        <EmailComposer document={doc} />
      </div>
      
      <DocumentPreview data={doc} />
    </div>
  )
}
