"use client";

import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/store";
import { Document } from "@/lib/types";
import LetterForm from "@/components/letters/LetterForm";

export default function EditLetterPage({ params }: { params: { id: string } }) {
  const [letter, setLetter] = useState<Document | null>(null);

  useEffect(() => {
    const fetchLetter = async () => {
      const allDocs = await getDocuments();
      const foundLetter = allDocs.find(doc => doc.id === params.id);
      setLetter(foundLetter || null);
    };
    fetchLetter();
  }, [params.id]);

  if (!letter) {
    return <div>Loading...</div>;
  }

  return <LetterForm initialData={letter} />;
}
