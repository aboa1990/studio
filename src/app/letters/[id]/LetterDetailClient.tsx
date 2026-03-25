
"use client";

import { useEffect, useState, useRef } from "react";
import { getDocuments, deleteDocument, updateDocument, useStore } from "@/lib/store";
import { Document } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import LetterActions from "@/components/letters/LetterActions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LetterDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { currentProfile } = useStore();
  const [letter, setLetter] = useState<Document | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLetter = async () => {
      const letterDocs = await getDocuments('letter');
      const foundLetter = letterDocs.find(doc => doc.id === id);
      setLetter(foundLetter || null);
      setEditedNotes(foundLetter?.notes || "");
    };
    fetchLetter();
  }, [id]);

  const handleDelete = async () => {
    if (letter && confirm("Are you sure you want to delete this letter?")) {
      const success = await deleteDocument(letter.id);
      if (success) {
        router.push("/letters");
      }
    }
  };

  const handleDownload = async () => {
    if (letterRef.current) {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      html2canvas(letterRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`Letter-${letter?.number}.pdf`);
      });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedNotes(e.target.value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (letter) {
      const updatedLetter = { ...letter, notes: editedNotes };
      const success = await updateDocument(letter.id, updatedLetter);
      if (success) {
        setLetter(updatedLetter);
        setIsEditing(false);
      }
    }
  };

  if (!letter || !currentProfile) {
    return <div className="p-10 text-center text-muted-foreground text-xs">Loading...</div>;
  }

  const isThaana = letter.language === 'dhivehi';

  const t = {
    english: { to: "To:", letterNo: "LTR/No:", subject: "Subject", sincerely: "Sincerely,", authorisedSignatory: "Authorised Signatory", date: "Date:" },
    dhivehi: { to: "އިލާ:", letterNo: "ނަންބަރު:", subject: "މައުޟޫޢު", sincerely: "އިޚްލާޞްތެރިކަމާއެކު،", authorisedSignatory: "ހުއްދަ ލިބިފައިވާ ފަރާތް", date: "ތާރީޚް:" }
  }[letter.language || 'english'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl font-bold">Letter {letter.number}</h1>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button size="sm" onClick={handleSave} className="text-xs h-8">Save Changes</Button>
          )}
          <LetterActions letter={{...letter, notes: editedNotes}} handleDelete={handleDelete} handleDownload={handleDownload} />
        </div>
      </div>

      <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl border-none">
        <CardContent className="p-0">
          <div 
            ref={letterRef} 
            className={cn(
              "bg-white p-12 font-serif text-black min-h-[1000px] flex flex-col",
              isThaana ? 'thaana-font' : ''
            )}
          >
            {isThaana && <div className="text-center text-sm mb-8">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>}
            
            {currentProfile.letterhead_url ? (
              <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-10" />
            ) : (
              <header className={cn("flex justify-between items-start mb-10", isThaana ? 'text-right' : 'text-left')}>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentProfile.name}</h2>
                  <p className="text-[10px] text-gray-600">{currentProfile.address}</p>
                  <p className="text-[10px] text-gray-600">{currentProfile.email} | {currentProfile.phone}</p>
                </div>
                <div>
                  {currentProfile.logo_url && <img src={currentProfile.logo_url} alt="Company Logo" className="h-12 w-auto" />}
                </div>
              </header>
            )}

            {isThaana ? (
              <div className="text-right text-black">
                <div className="mb-6">
                  <p className="text-sm font-bold">{letter.clientName}</p>
                  <p className="text-xs">{letter.clientAddress}</p>
                </div>
                <p className="mb-4 text-xs"><span className="font-bold">{t.letterNo}</span> {letter.number}</p>
                <p className="mb-8 font-bold text-sm">{letter.terms}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-8 text-black">
                  <div>
                    <h3 className="font-bold text-xs text-gray-700 mb-1">{t.to}</h3>
                    <p className="text-sm font-semibold">{letter.clientName}</p>
                    <p className="text-xs text-gray-600">{letter.clientAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs"><span className="font-bold">{t.letterNo}</span> {letter.number}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      <span className="font-bold">{t.date}</span> {new Date(letter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-6 text-black border-b border-gray-100 pb-2">{letter.terms}</h3>
              </>
            )}

            <Textarea
              value={editedNotes}
              onChange={handleNotesChange}
              className={cn(
                "flex-grow whitespace-pre-wrap w-full border-none p-0 text-xs leading-relaxed focus-visible:ring-0 text-black bg-transparent resize-none",
                isThaana ? 'text-right' : 'text-left'
              )}
              dir={isThaana ? 'rtl' : 'ltr'}
              rows={20}
            />

            <footer className="mt-12 text-black">
              {isThaana && <p className="mb-4 text-center text-xs">{new Date(letter.date).toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
              <div className={cn(isThaana ? 'text-right' : 'text-left')}>
                <p className="mb-2 text-xs">{t.sincerely}</p>
                {currentProfile.signature_url ? (
                  <img src={currentProfile.signature_url} alt="Signature" className={cn("h-12 w-auto mb-1", isThaana && "mr-auto")} />
                ) : (
                  <div className="h-12"></div>
                )}
                <p className="font-bold text-xs">{currentProfile.authorized_signatory || currentProfile.name}</p>
                <p className="text-[10px] text-gray-500">{t.authorisedSignatory}</p>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
