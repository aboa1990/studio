
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

export default function LetterForm({ initialData }: { initialData?: Document }) {
  const router = useRouter();
  const { currentProfile } = useStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [letterNumber, setLetterNumber] = useState("");
  const [subject, setSubject] = useState(initialData?.terms || "");
  const [body, setBody] = useState(initialData?.notes || "");
  const [language, setLanguage] = useState<'english' | 'dhivehi'>('english');

  useEffect(() => {
    const fetchClientsAndDocs = async () => {
      const [fetchedClients, letterDocs] = await Promise.all([
        getClients(), 
        getDocuments('letter')
      ]);
      
      setClients(fetchedClients);
      if (initialData?.client_id) {
        const initialClient = fetchedClients.find(c => c.id === initialData.client_id);
        setClient(initialClient || null);
      }

      if (initialData?.number) {
        setLetterNumber(initialData.number);
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

  useEffect(() => {
    if (initialData?.language) {
      setLanguage(initialData.language);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!currentProfile || !client) return;

    const newLetter: Document = {
      id: initialData?.id || crypto.randomUUID(),
      profile_id: currentProfile.id,
      type: 'letter',
      number: letterNumber,
      client_id: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
      items: [],
      taxRate: 0,
      date: new Date().toISOString(),
      status: 'draft',
      currency: 'USD',
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
    }
  };

  const isThaana = language === 'dhivehi';

  const t = {
    english: {
      to: "To:",
      letterNo: "Letter #:",
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
      subject: "މައުޟޫޢު",
      writeLetter: "މިތަނުގައި ދެން ލިޔުއްވާ...",
      sincerely: "އިޚްލާޞްތެރިކަމާއެކު،",
      authorisedSignatory: "ހުއްދަ ލިބިފައިވާ ފަރާތް",
      newLetter: "އަލަށް ደބްދާބީ",
      save: "ސޭވް",
      client: "ደንበኛ",
      selectClient: "ደንበኛއެއް ހޮވާ",
      language: "ބަސް",
    }
  }[language];

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{initialData ? `Edit Letter` : t.newLetter}</h1>
        <Button onClick={handleSave} size="sm" disabled={!client} className="text-xs h-8">{t.save}</Button>
      </div>
      <div className="flex-grow flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3">
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="py-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t.client}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <Select 
                  value={client?.id}
                  onValueChange={(clientId) => {
                    const selectedClient = clients.find(c => c.id === clientId);
                    setClient(selectedClient || null);
                  }}>
                  <SelectTrigger className="h-8 text-xs">
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
            <Card className="shadow-sm">
              <CardHeader className="py-3">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t.language}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <Select value={language} onValueChange={(value: 'english' | 'dhivehi') => setLanguage(value)}>
                  <SelectTrigger className="h-8 text-xs">
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
          "w-full lg:w-2/3 bg-white rounded-md p-10 shadow-xl font-serif text-black border min-h-[800px]",
          isThaana ? 'thaana-font' : ''
        )}>
          {isThaana && <div className="text-center text-sm mb-6 text-black">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>}
          
          {currentProfile?.letterhead_url ? (
            <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-8" />
          ) : (
            <header className={cn("flex justify-between items-start mb-10", isThaana ? 'text-right' : 'text-left')}>
              <div className={isThaana ? 'text-right' : 'text-left'}>
                <h2 className="text-xl font-bold text-gray-900">{currentProfile?.name}</h2>
                <p className="text-[10px] text-gray-600">{currentProfile?.address}</p>
                <p className="text-[10px] text-gray-600">{currentProfile?.email} | {currentProfile?.phone}</p>
              </div>
              <div>
                {currentProfile?.logo_url && <img src={currentProfile?.logo_url} alt="Company Logo" className="h-12 w-auto" />}
              </div>
            </header>
          )}

          {isThaana ? (
              <div dir="rtl">
                  <div className="flex flex-col items-end text-right mb-6">
                      <Input value={client?.name || ''} readOnly className="border-none text-right px-0 h-6 focus-visible:ring-0 text-black bg-transparent text-sm font-semibold" placeholder="Client Name" />
                      <Input value={client?.address || ''} readOnly className="border-none text-right px-0 h-6 focus-visible:ring-0 text-black bg-transparent text-xs" placeholder="Client Address"/>
                      <div className="flex items-center gap-2 mt-4 mb-2">
                          <label htmlFor="letter-number" className="font-bold text-xs text-black">{t.letterNo}</label>
                          <Input id="letter-number" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-16 border-none text-right px-0 h-6 focus-visible:ring-0 text-black bg-transparent text-xs" dir="ltr" />
                      </div>
                      <Input 
                          placeholder={t.subject}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="text-sm font-bold border-none text-right px-0 h-8 focus-visible:ring-0 text-black bg-transparent mt-2"
                          dir="rtl"
                      />
                  </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-6">
                  <div className="text-black">
                    <h3 className="font-bold text-xs text-gray-700 mb-1">{t.to}</h3>
                    <p className="text-xs font-semibold">{client?.name || 'Client Name'}</p>
                    <p className="text-[10px] text-gray-600">{client?.address || 'Client Address'}</p>
                  </div>
                  <div className="text-right text-black">
                      <div className="flex items-center justify-end gap-1">
                          <label htmlFor="letter-number" className="font-bold text-xs">{t.letterNo}</label>
                          <Input id="letter-number" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-20 border-b border-gray-200 rounded-none px-1 h-6 text-xs focus-visible:ring-0 text-black bg-transparent" dir="ltr" />
                      </div>
                    <p className="text-[10px] text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                 <Input 
                    placeholder={t.subject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mb-6 text-sm font-bold border-0 border-b-2 border-gray-100 rounded-none px-0 h-10 focus-visible:ring-0 text-black bg-transparent placeholder:text-gray-300"
                  />
              </>
          )}

          <Textarea 
            placeholder={t.writeLetter}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={cn(
              "flex-grow border-none p-0 text-xs leading-relaxed focus-visible:ring-0 resize-none text-black bg-transparent min-h-[400px] placeholder:text-gray-300",
              isThaana ? 'text-right' : 'text-left'
            )}
            dir={isThaana ? 'rtl' : 'ltr'}
          />

          <footer className="mt-10">
            {isThaana && <p className="mb-4 text-center text-xs text-black">{new Date().toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
            <div className={cn("text-black", isThaana ? 'text-right' : 'text-left')}>
              <p className="mb-2 text-xs">{t.sincerely}</p>
              {currentProfile?.signature_url ? (
                  <img src={currentProfile.signature_url} alt="Signature" className="h-12 w-auto mb-1" />
              ) : (
                  <div className="h-12"></div>
              )}
              <p className="font-bold text-xs">{currentProfile?.authorized_signatory || currentProfile?.name}</p>
              <p className="text-[10px] text-gray-500">{t.authorisedSignatory}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
