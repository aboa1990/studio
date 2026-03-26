"use client";

import { useEffect, useState, use } from "react";
import { getDocuments } from "@/lib/store";
import { Document } from "@/lib/types";
import LetterForm from "@/components/letters/LetterForm";

export default function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [letter, setLetter] = useState<Document | null>(null);

  useEffect(() => {
    const fetchLetter = async () => {
      const allDocs = await getDocuments();
      const foundLetter = allDocs.find(doc => doc.id === id);
      setLetter(foundLetter || null);
    };
    fetchLetter();
  }, [id]);

  if (!letter) {
    return <div className="p-20 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Loading...</div>;
  }

  return <LetterForm initialData={letter} />;
}
