
"use client";

import { useEffect, useState, useRef } from "react";
import { getDocuments, deleteDocument, updateDocument, useStore } from "@/lib/store";
import { Document, Client } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import LetterActions from "@/components/letters/LetterActions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
    return <div>Loading...</div>;
  }

  const isThaana = letter.language === 'dhivehi';

  const t = {
    english: { to: "To:", letterNo: "Letter #:", subject: "Subject", sincerely: "Sincerely,", authorisedSignatory: "Authorised Signatory" },
    dhivehi: { to: "އިލާ:", letterNo: "ނަންބަރު:", subject: "މައުޟޫޢު", sincerely: "އިޚްލާޞްތެރިކަމާއެކު،", authorisedSignatory: "ހުއްދަ ލިބިފައިވާ ފަރާތް" }
  }[letter.language || 'english'];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Letter {letter.number}</h1>
        <LetterActions letter={{...letter, notes: editedNotes}} handleDelete={handleDelete} handleDownload={handleDownload} />
      </div>
      {isEditing && (
          <div className="flex justify-end mb-4">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      <Card>
        <CardContent>
          <div ref={letterRef} className={`bg-white rounded-lg p-12 font-serif text-gray-900 ${isThaana ? 'thaana-font' : ''}`}>
            {isThaana && <div className="text-center text-xl mb-8">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>}
            {currentProfile.letterhead_url ? (
              <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-12" />
            ) : (
              <header className={`flex justify-between items-start mb-12 ${isThaana ? 'text-right' : ''}`}>
                <div className={isThaana ? 'text-right' : 'text-left'}>
                  <h2 className="text-3xl font-bold text-gray-800">{currentProfile.name}</h2>
                  <p className="text-sm text-gray-600">{currentProfile.address}</p>
                  <p className="text-sm text-gray-600">{currentProfile.email} | {currentProfile.phone}</p>
                </div>
                <div>
                  {currentProfile.logo_url && <img src={currentProfile.logo_url} alt="Company Logo" className="h-20 w-auto" />}
                </div>
              </header>
            )}
            {isThaana ? (
              <div className="text-right">
                <div className="mb-4">
                  <p>{letter.clientName}</p>
                  <p>{letter.clientAddress}</p>
                </div>
                <p className="mb-4"><span className="font-bold">{t.letterNo}</span> {letter.number}</p>
                <p className="mb-8 font-bold">{letter.terms}</p>
              </div>
            ) : (
              <>
                <div className={`flex justify-between mb-8`}>
                  <div>
                    <h3 className="font-bold text-gray-700">{t.to}</h3>
                    <p>{letter.clientName}</p>
                    <p>{letter.clientAddress}</p>
                  </div>
                  <div className={'text-right'}>
                    <p><span className="font-bold">{t.letterNo}</span> {letter.number}</p>
                    <p>{new Date(letter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <h3 className={`text-lg font-bold mb-4`}>{letter.terms}</h3>
              </>
            )}
            <Textarea
              value={editedNotes}
              onChange={handleNotesChange}
              className={`whitespace-pre-wrap w-full h-auto p-2 border rounded-md ${isThaana ? 'text-right' : ''}`}
              dir={isThaana ? 'rtl' : 'ltr'}
              rows={10}
            />
            <footer className={"mt-12"}>
              {isThaana && <p className="mb-4 text-center">{new Date(letter.date).toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
              <div className={isThaana ? 'text-right' : 'text-left'}>
                <p className="mb-4">{t.sincerely}</p>
                {currentProfile.signature_url ? (
                  <img src={currentProfile.signature_url} alt="Signature" className={`h-16 w-auto ${isThaana ? 'ml-auto' : ''}`} />
                ) : (
                  <div className="h-16"></div>
                )}
                <p className="font-bold">{currentProfile.authorized_signatory || currentProfile.name}</p>
                <p>{t.authorisedSignatory}</p>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
