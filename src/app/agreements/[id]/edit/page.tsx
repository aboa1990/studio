
"use client"

import { useEffect, useState, use } from "react"
import { getDocumentById } from "@/lib/store"
import { Document } from "@/lib/types"
import AgreementForm from "@/components/agreements/AgreementForm"

export default function EditAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const found = await getDocumentById(id);
      if (found && found.type === 'agreement') setDoc(found);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-xs font-bold uppercase tracking-widest opacity-50">Loading...</div>;
  if (!doc) return <div className="p-20 text-center text-xs font-bold uppercase tracking-widest opacity-50">Agreement not found.</div>;

  return (
    <div className="py-10">
      <AgreementForm initialData={doc} />
    </div>
  )
}
