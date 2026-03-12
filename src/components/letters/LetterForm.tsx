
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
      const [fetchedClients, allDocs] = await Promise.all([getClients(), getDocuments()]);
      
      setClients(fetchedClients);
      if (initialData?.client_id) {
        const initialClient = fetchedClients.find(c => c.id === initialData.client_id);
        setClient(initialClient || null);
      }

      if (initialData?.number) {
        setLetterNumber(initialData.number);
      } else {
        const letterDocs = allDocs.filter(doc => doc.type === 'letter');
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
      newLetter: "އަލަށް ደብዳބީ",
      save: "ސޭވް",
      client: "ደንበኛ",
      selectClient: "ደንበኛއެއް ހޮވާ",
      language: "ބަސް",
    }
  }[language];

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{initialData ? `Edit Letter` : t.newLetter}</h1>
        <Button onClick={handleSave} disabled={!client}>{t.save}</Button>
      </div>
      <div className="flex-grow flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.client}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={client?.id}
                  onValueChange={(clientId) => {
                    const selectedClient = clients.find(c => c.id === clientId);
                    setClient(selectedClient || null);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectClient} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.language}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={language} onValueChange={(value: 'english' | 'dhivehi') => setLanguage(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="dhivehi">Dhivehi (Thaana)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className={`w-full lg:w-2/3 bg-white rounded-lg p-12 shadow-lg font-serif text-gray-900 ${isThaana ? 'thaana-font' : ''}`}>
          {isThaana && <div className="text-center text-xl mb-8">بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ</div>}
          
          {currentProfile?.letterhead_url ? (
            <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-12" />
          ) : (
            <header className={`flex justify-between items-start mb-12 ${isThaana ? 'text-right' : ''}`}>
              <div className={isThaana ? 'text-right' : 'text-left'}>
                <h2 className="text-3xl font-bold text-gray-800">{currentProfile?.name}</h2>
                <p className="text-sm text-gray-600">{currentProfile?.address}</p>
                <p className="text-sm text-gray-600">{currentProfile?.email} | {currentProfile?.phone}</p>
              </div>
              <div>
                {currentProfile?.logo_url && <img src={currentProfile?.logo_url} alt="Company Logo" className="h-20 w-auto" />}
              </div>
            </header>
          )}

          {isThaana ? (
              <div dir="rtl">
                  <div className="flex flex-col items-end text-right mb-8">
                      <Input value={client?.name || ''} readOnly className="border-none text-right px-0 mb-1 focus-visible:ring-0" placeholder="Client Name" />
                      <Input value={client?.address || ''} readOnly className="border-none text-right px-0 mb-4 focus-visible:ring-0" placeholder="Client Address"/>
                      <div className="flex items-center gap-2 mb-4">
                          <label htmlFor="letter-number" className="font-bold">{t.letterNo}</label>
                          <Input id="letter-number" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-24 border-none text-right px-0 focus-visible:ring-0" dir="ltr" />
                      </div>
                      <Input 
                          placeholder={t.subject}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={`text-lg font-bold border-none text-right px-0 focus-visible:ring-0`}
                          dir="rtl"
                      />
                  </div>
              </div>
            ) : (
              <>
                <div className={`flex justify-between mb-8`}>
                  <div>
                    <h3 className="font-bold text-gray-700">{t.to}</h3>
                    <p>{client?.name}</p>
                    <p>{client?.address}</p>
                  </div>
                  <div className={'text-right'}>
                      <div className="flex items-center gap-2">
                          <label htmlFor="letter-number" className="font-bold">{t.letterNo}</label>
                          <Input id="letter-number" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-24" dir="ltr" />
                      </div>
                    <p className="mt-2">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                 <Input 
                    placeholder={t.subject}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`mb-8 text-lg font-bold border-0 border-b-2 rounded-none px-0 focus-visible:ring-0`}
                  />
              </>
          )}

          <Textarea 
            placeholder={t.writeLetter}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`flex-grow border-none p-0 text-base leading-relaxed focus-visible:ring-0 resize-none ${isThaana ? 'text-right' : ''}`}
            rows={15}
            dir={isThaana ? 'rtl' : 'ltr'}
          />

          <footer className={"mt-12"}>
            {isThaana && <p className="mb-4 text-center">{new Date().toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
            <div className="text-left">
              <p className="mb-4">{t.sincerely}</p>
              {currentProfile?.signature_url ? (
                  <img src={currentProfile.signature_url} alt="Signature" className={`h-16 w-auto`} />
              ) : (
                  <div className="h-16"></div>
              )}
              <p className="font-bold">{currentProfile?.authorized_signatory || currentProfile?.name}</p>
              <p>{t.authorisedSignatory}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
