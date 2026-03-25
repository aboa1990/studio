
"use client";

import { useEffect, useState, useRef } from "react";
import { getDocumentById, deleteDocument, updateDocument, useStore } from "@/lib/store";
import { Document } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import LetterActions from "@/components/letters/LetterActions";
import EmailComposer from "@/components/documents/EmailComposer";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function LetterDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { currentProfile } = useStore();
  const [letter, setLetter] = useState<Document | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLetter = async () => {
      setLoading(true);
      const foundLetter = await getDocumentById(id);
      if (foundLetter && foundLetter.type === 'letter') {
        setLetter(foundLetter);
        setEditedNotes(foundLetter.notes || "");
      }
      setLoading(false);
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

      html2canvas(letterRef.current, { scale: 3, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
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

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Loading Letter...</p>
      </div>
    );
  }

  if (!letter || !currentProfile) {
    return <div className="p-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Letter not found.</div>;
  }

  const isThaana = letter.language === 'dhivehi';

  const t = {
    english: { to: "To:", letterNo: "LTR/No:", subject: "Subject", sincerely: "Sincerely,", authorisedSignatory: "Authorised Signatory", date: "Date:" },
    dhivehi: { to: "އިލާ:", letterNo: "ނަންބަރު:", subject: "މައުޟޫޢު", sincerely: "އިޚްލާޞްތެރިކަމާއެކު،", authorisedSignatory: "ހުއްދަ ލިބިފައިވާ ފަރާތް", date: "ތާރީޚް:" }
  }[letter.language || 'english'];

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Letter {letter.number}</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Reference: {letter.number}</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <Button size="sm" onClick={handleSave} className="text-[10px] font-bold uppercase tracking-widest h-8 bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          )}
          <EmailComposer document={letter} />
          <LetterActions letter={{...letter, notes: editedNotes}} handleDelete={handleDelete} handleDownload={handleDownload} />
        </div>
      </div>

      <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl border-none">
        <CardContent className="p-0">
          <div 
            ref={letterRef} 
            className={cn(
              "bg-white p-16 font-serif text-black min-h-[1050px] flex flex-col",
              isThaana ? 'thaana-font' : ''
            )}
          >
            {isThaana && <div className="text-center text-sm mb-10 text-black">بِسْمِ اللَّـهِ الرَّހْمَـٰنِ الرَّހީމް</div>}
            
            {currentProfile.letterhead_url ? (
              <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-12" />
            ) : (
              <header className={cn("flex justify-between items-start mb-12", isThaana ? 'text-right' : 'text-left text-black')}>
                <div className={isThaana ? 'text-right' : 'text-left'}>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{currentProfile.name}</h2>
                  <p className="text-[11px] text-gray-500">{currentProfile.address}</p>
                  <p className="text-[11px] text-gray-500">{currentProfile.email} | {currentProfile.phone}</p>
                </div>
                <div>
                  {currentProfile.logo_url && <img src={currentProfile.logo_url} alt="Company Logo" className="h-20 w-auto" />}
                </div>
              </header>
            )}

            {isThaana ? (
              <div className="text-right text-black">
                <div className="mb-8">
                  <p className="text-sm font-bold text-black">{letter.clientName}</p>
                  <p className="text-xs text-black">{letter.clientAddress}</p>
                </div>
                <div className="flex items-center justify-end gap-2 mb-1">
                    <p className="text-xs text-black"><span className="font-bold">{t.letterNo}</span> {letter.number}</p>
                </div>
                <p className="mb-8 text-xs text-black"><span className="font-bold">{t.date}</span> {new Date(letter.date).toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="mb-10 font-bold text-sm text-black border-b border-gray-100 pb-2">{letter.terms}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-10 text-black">
                  <div>
                    <h3 className="font-bold text-[10px] text-gray-400 mb-1">{t.to}</h3>
                    <p className="text-sm font-bold">{letter.clientName}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{letter.clientAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold"><span className="text-gray-400 font-bold mr-1">{t.letterNo}</span> {letter.number}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      <span className="font-bold text-gray-400">{t.date}</span> {new Date(letter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-8 text-black border-b border-gray-100 pb-2 uppercase tracking-tight">{letter.terms}</h3>
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
              rows={25}
            />

            <footer className="mt-16 text-black">
              <div className={cn(isThaana ? 'text-right' : 'text-left')}>
                <p className="mb-4 text-xs">{t.sincerely}</p>
                {currentProfile.signature_url ? (
                  <img src={currentProfile.signature_url} alt="Signature" className={cn("h-12 w-auto mb-1", isThaana && "mr-0")} />
                ) : (
                  <div className="h-12"></div>
                )}
                <div className="mt-2">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t.authorisedSignatory}</p>
                  <p className="font-bold text-xs mt-0.5">{currentProfile.authorized_signatory || currentProfile.name}</p>
                </div>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
