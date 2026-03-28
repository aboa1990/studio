
"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDocumentById, deleteDocument, updateDocument, useStore } from "@/lib/store"
import { Document } from "@/lib/types"
import EmailComposer from "@/components/documents/EmailComposer"
import { ChevronLeft, Download, Edit, Trash2, Printer, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AgreementDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { currentProfile } = useStore()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      const found = await getDocumentById(id as string);
      if (found && found.type === 'agreement') setDoc(found);
      setLoading(false);
    };
    if(id) fetchDoc();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-20 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin" /><p className="text-xs font-bold uppercase">Loading Agreement...</p></div>;
  if (!doc || !currentProfile) return <div className="p-20 text-center text-muted-foreground">Agreement not found.</div>;

  const isThaana = doc.language === 'dhivehi';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6 no-print">
        <Button variant="ghost" onClick={() => router.push('/agreements')} className="mr-auto">
          <ChevronLeft className="mr-2 h-4 w-4" /> All Agreements
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="text-[10px] font-bold h-8 uppercase tracking-widest">
            <Printer className="mr-2 h-3.5 w-3.5" /> Print / Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/agreements/${doc.id}/edit`)} className="text-[10px] font-bold h-8 uppercase tracking-widest">
            <Edit className="mr-2 h-3.5 w-3.5" /> Edit Terms
          </Button>
          <EmailComposer document={doc} />
        </div>
      </div>
      
      <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl border-none print-content">
        <CardContent className="p-0">
          <div 
            ref={printRef} 
            className={cn(
              "bg-white p-16 font-serif text-black min-h-[1050px] flex flex-col print:p-10",
              isThaana ? 'thaana-font' : ''
            )}
          >
            {isThaana && <div className="text-center text-sm mb-10 text-black">بِسْمِ اللَّـهِ الرَّހْمَـٰنِ الرَّހީމް</div>}
            
            {currentProfile.letterhead_url ? (
              <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-12" />
            ) : (
              <header className={cn("flex justify-between items-start mb-12", isThaana ? 'text-right' : 'text-left text-black')}>
                <div className={isThaana ? 'text-right' : 'text-left'}>
                  <h2 className="text-xl font-bold text-slate-950 leading-tight">{currentProfile.name}</h2>
                  <p className="text-[11px] text-slate-700 font-medium">{currentProfile.address}</p>
                </div>
                <div>
                  {currentProfile.logo_url && <img src={currentProfile.logo_url} alt="Logo" className="h-20 w-auto" />}
                </div>
              </header>
            )}

            <div className={cn("mb-10", isThaana ? 'text-right' : 'text-center')}>
              <h1 className="text-2xl font-black text-slate-950 uppercase border-b-2 border-slate-900 pb-2 mb-2">{doc.terms}</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest">AGREEMENT REF: {doc.number}</p>
            </div>

            <div 
              className={cn(
                "flex-grow text-xs leading-relaxed text-slate-900 font-medium rich-text-content",
                isThaana ? 'text-right' : 'text-left'
              )} 
              dir={isThaana ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: doc.notes || "" }}
            />

            <footer className="mt-16 text-black border-t border-slate-100 pt-8">
              <div className="grid grid-cols-2 gap-20">
                <div className={cn(isThaana ? 'text-right order-2' : 'text-left')}>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-8">For the First Party:</p>
                  {currentProfile.signature_url && (
                    <img src={currentProfile.signature_url} alt="Signature" className="h-12 w-auto mb-2" />
                  )}
                  <div className="border-t border-slate-300 pt-2 w-full">
                    <p className="font-bold text-xs text-slate-950">{currentProfile.authorized_signatory || currentProfile.name}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Authorized Signatory</p>
                  </div>
                </div>
                <div className={cn(isThaana ? 'text-right order-1' : 'text-left')}>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-8">For the Second Party:</p>
                  <div className="h-12"></div>
                  <div className="border-t border-slate-300 pt-2 w-full">
                    <p className="font-bold text-xs text-slate-950">{doc.clientName}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Party Representative</p>
                  </div>
                </div>
              </div>
              {currentProfile.seal_url && (
                <div className="flex justify-center mt-8">
                  <img src={currentProfile.seal_url} alt="Seal" className="h-24 w-24 opacity-80" />
                </div>
              )}
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
