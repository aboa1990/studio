
"use client"

import { useEffect, useState } from "react";
import { useStore, getClients, getDocuments } from "@/lib/store";
import { Document, Client } from "@/lib/types";
import { saveDocument } from "@/lib/store";
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
      
      // Set clients
      setClients(fetchedClients);
      if (initialData?.client_id) {
        const initialClient = fetchedClients.find(c => c.id === initialData.client_id);
        setClient(initialClient || null);
      }

      // Set Letter Number
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
      currency: 'USD', // Or your default currency
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      notes: body,
      terms: subject, // Using terms to store the subject
      language: language,
    };

    const saved = await saveDocument(newLetter);
    if (saved) {
      router.push('/letters');
    }
  };

  const isThaana = language === 'dhivehi';

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">New Letter</h1>
        <Button onClick={handleSave} disabled={!client}>Save</Button>
      </div>
      <div className="flex-grow flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={client?.id}
                  onValueChange={(clientId) => {
                    const selectedClient = clients.find(c => c.id === clientId);
                    setClient(selectedClient || null);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
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
                <CardTitle>Language</CardTitle>
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
        <div className={`w-full lg:w-2/3 bg-white rounded-lg p-12 shadow-lg font-serif ${isThaana ? 'thaana-font' : ''}`}>
          {/* Letterhead */}
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

          {/* Client Info and Date */}
          <div className={`flex justify-between mb-8 ${isThaana ? 'text-right' : ''}`}>
            <div className={isThaana ? 'text-right' : 'text-left'}>
              <h3 className="font-bold text-gray-700">To:</h3>
              <p>{client?.name}</p>
              <p>{client?.address}</p>
            </div>
            <div className={isThaana ? 'text-left' : 'text-right'}>
                <div className="flex items-center gap-2">
                    <label htmlFor="letter-number" className="font-bold">Letter #:</label>
                    <Input id="letter-number" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} className="w-24" dir="ltr" />
                </div>
              <p className="mt-2">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Subject */}
          <Input 
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`mb-8 text-lg font-bold border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 ${isThaana ? 'text-right' : ''}`}
            dir={isThaana ? 'rtl' : 'ltr'}
          />

          {/* Body */}
          <Textarea 
            placeholder="Write your letter here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`flex-grow border-none p-0 text-base leading-relaxed focus-visible:ring-0 resize-none ${isThaana ? 'text-right' : ''}`}
            rows={15}
            dir={isThaana ? 'rtl' : 'ltr'}
          />

          {/* Closing */}
          <footer className={`mt-12 ${isThaana ? 'text-right' : ''}`}>
            <p className="mb-4">Sincerely,</p>
            {currentProfile?.signature_url ? (
                <img src={currentProfile.signature_url} alt="Signature" className="h-16 w-auto" />
            ) : (
                <div className="h-16"></div>
            )}
            <p className="font-bold">{currentProfile?.authorized_signatory || currentProfile?.name}</p>
            <p>Authorised Signatory</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
