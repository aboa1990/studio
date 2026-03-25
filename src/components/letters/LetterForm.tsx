
"use client"

import { useEffect, useState } from "react";
import { useStore, getClients, getDocuments, saveDocument } from "@/lib/store";
import { Document, Client } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Loader2 } from "lucide-react";

export default function LetterForm({ initialData }: { initialData?: Document }) {
  const router = useRouter();
  const { currentProfile } = useStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [letterNumber, setLetterNumber] = useState("");
  const [subject, setSubject] = useState(initialData?.terms || "");
  const [body, setBody] = useState(initialData?.notes || "");
  const [language, setLanguage] = useState<'english' | 'dhivehi'>('english');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchClientsAndDocs = async () => {
      const fetchedClients = await getClients();
      setClients(fetchedClients);
      
      const letterDocs = await getDocuments('letter');

      if (initialData) {
        const initialClient = fetchedClients.find(c => c.id === initialData.client_id);
        setClient(initialClient || null);
        setLetterNumber(initialData.number);
        setSubject(initialData.terms || "");
        setBody(initialData.notes || "");
        setLanguage(initialData.language || 'english');
      } else {
        const maxNumber = letterDocs.reduce((max, doc) => {
          const currentNum = parseInt(doc.number, 10);
          return isNaN(currentNum) ? max : Math.max(max, currentNum);
        }, 0);
        setLetterNumber((maxNumber + 1).toString());
      }
    };
    fetchClientsAndDocs();
  }, [initialData]);

  const handleSave = async () => {
    if (!currentProfile || !client) return;
    setIsSaving(true);

    try {
      const newLetter: Document = {
        id: initialData?.id || uuidv4(),
        profile_id: currentProfile.id,
        type: 'letter',
        number: letterNumber,
        client_id: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: client.address,
        items: [],
        taxRate: 0,
        date: initialData?.date || new Date().toISOString(),
        status: 'sent',
        currency: 'MVR',
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        notes: body,
        terms: subject,
        language: language,
      };

      const saved = await saveDocument(newLetter);
      if (saved) {
        router.push('/letters');
        router.refresh();
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isThaana = language === 'dhivehi';

  const t = {
    english: {
      to: "To:",
      letterNo: "LTR/No:",
      date: "Date:",
      subject: "Subject",
      writeLetter: "Write your letter here...",
      sincerely: "Sincerely,",
      authorisedSignatory: "Authorised Signatory",
      newLetter: "New Letter",
      save: "Save",
      client: "Client",
      selectClient: "Select a client",
      language: "Language",
    },
    dhivehi: {
      to: "އިލާ:",
      letterNo: "ނަންބަރު:",
      date: "ތާރީޚް:",
      subject: "މައުޟޫޢު",
      writeLetter: "މިތަނުގައި ދެން ލިޔުއްވާ...",
      sincerely: "އިޚްލާޞްތެރިކަމާއެކު،",
      authorisedSignatory: "ހުއްދަ ލިބިފައިވާ ފަރާތް",
      newLetter: "އަލަށް ދެންނެވުން",
      save: "ސޭވް",
      client: "ደንބኛ",
      selectClient: "ደንބኛއެއް ހޮވާ",
      language: "ބަސް",
    }
  }[language];

  return (
    <div className="p-4 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">{initialData ? `Edit Letter` : t.newLetter}</h1>
        <Button onClick={handleSave} size="sm" disabled={!client || isSaving} className="text-xs h-8">
          {isSaving ? <Loader2 className="size-3 animate-spin mr-2" /> : null}
          {t.save}
        </Button>
      </div>
      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <div className="space-y-4">
            <Card className="shadow-sm border-white/5">
              <CardHeader className="py-3">
                <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.client}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <Select 
                  value={client?.id}
                  onValueChange={(clientId) => {
                    const selectedClient = clients.find(c => c.id === clientId);
                    setClient(selectedClient || null);
                  }}>
                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                    <SelectValue placeholder={t.selectClient} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-white/5">
              <CardHeader className="py-3">
                <CardTitle className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.language}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <Select value={language} onValueChange={(value: 'english' | 'dhivehi') => setLanguage(value)}>
                  <SelectTrigger className="h-8 text-xs bg-muted/50">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english" className="text-xs">English</SelectItem>
                    <SelectItem value="dhivehi" className="text-xs">Dhivehi (Thaana)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Letter Sheet */}
        <div className={cn(
          "w-full lg:w-3/4 bg-white rounded-md p-12 shadow-2xl font-serif text-black border-none min-h-[900px] flex flex-col",
          isThaana ? 'thaana-font' : ''
        )}>
          {isThaana && <div className="text-center text-sm mb-6 text-black">بِسْمِ اللَّـهِ الرَّހْمَـٰنِ الرَّހީމް</div>}
          
          {currentProfile?.letterhead_url ? (
            <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-10" />
          ) : (
            <header className={cn("flex justify-between items-start mb-10", isThaana ? 'text-right' : 'text-left text-black')}>
              <div className={isThaana ? 'text-right' : 'text-left'}>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{currentProfile?.name}</h2>
                <p className="text-[11px] text-gray-500">{currentProfile?.address}</p>
                <p className="text-[11px] text-gray-500">{currentProfile?.email} | {currentProfile?.phone}</p>
              </div>
              <div>
                {currentProfile?.logo_url && <img src={currentProfile?.logo_url} alt="Company Logo" className="h-20 w-auto" />}
              </div>
            </header>
          )}

          {isThaana ? (
              <div dir="rtl">
                  <div className="flex flex-col items-end text-right mb-6">
                      <p className="text-sm font-bold text-black">{client?.name || ''}</p>
                      <p className="text-xs text-black">{client?.address || ''}</p>
                      <div className="flex items-center gap-2 mt-4">
                          <label className="font-bold text-xs text-black">{t.letterNo}</label>
                          <Input value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-20 border-none text-right px-0 h-6 focus-visible:ring-0 text-black bg-transparent text-xs" dir="ltr" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                          <label className="font-bold text-xs text-black">{t.date}</label>
                          <p className="text-xs text-black">{new Date().toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <Input 
                          placeholder={t.subject}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="text-sm font-bold border-none text-right px-0 h-10 focus-visible:ring-0 text-black bg-transparent mt-4 border-b border-gray-100"
                          dir="rtl"
                      />
                  </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-8">
                  <div className="text-black">
                    <h3 className="font-bold text-[10px] text-gray-400 mb-1">{t.to}</h3>
                    <p className="text-sm font-bold">{client?.name || 'Client Name'}</p>
                    <p className="text-[11px] text-gray-500">{client?.address || 'Client Address'}</p>
                  </div>
                  <div className="text-right text-black">
                      <div className="flex items-center justify-end gap-1">
                          <label className="font-bold text-[10px] text-gray-400">{t.letterNo}</label>
                          <Input value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-24 border-none p-0 text-right h-5 text-xs font-bold focus-visible:ring-0 text-black bg-transparent" dir="ltr" />
                      </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      <span className="font-bold text-gray-400">{t.date}</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                 <Input 
                    placeholder={t.subject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mb-8 text-sm font-bold border-0 border-b border-gray-100 rounded-none px-0 h-10 focus-visible:ring-0 text-black bg-transparent placeholder:text-gray-200"
                  />
              </>
          )}

          <Textarea 
            placeholder={t.writeLetter}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn(
              "flex-grow border-none p-0 text-xs leading-relaxed focus-visible:ring-0 resize-none text-black bg-transparent min-h-[400px] placeholder:text-gray-200",
              isThaana ? 'text-right' : 'text-left'
            )}
            dir={isThaana ? 'rtl' : 'ltr'}
          />

          <footer className="mt-12 text-black">
            <div className={cn("text-black", isThaana ? 'text-right' : 'text-left')}>
              <p className="mb-4 text-xs">{t.sincerely}</p>
              {currentProfile?.signature_url ? (
                  <img src={currentProfile.signature_url} alt="Signature" className={cn("h-12 w-auto mb-1", isThaana && "mr-0")} />
              ) : (
                  <div className="h-12"></div>
              )}
              <div className="mt-2">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t.authorisedSignatory}</p>
                <p className="font-bold text-xs mt-0.5">{currentProfile?.authorized_signatory || currentProfile?.name}</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
