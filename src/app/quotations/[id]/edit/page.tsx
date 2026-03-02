
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getDocuments } from "@/lib/store"
import { Document } from "@/lib/types"
import DocumentForm from "@/components/documents/DocumentForm"

export default function EditQuotationPage() {
  const { id } = useParams()
  const [doc, setDoc] = useState<Document | null>(null)

  useEffect(() => {
    const found = getDocuments().find(d => d.id === id);
    if (found) setDoc(found);
  }, [id]);

  if (!doc) return <div className="p-20 text-center">Loading...</div>;

  return <DocumentForm type="quotation" initialData={doc} />
}
