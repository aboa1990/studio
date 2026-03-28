
"use client"

import { useEffect, useState, useRef } from "react";
import { useStore, getClients, getDocuments, saveDocument } from "@/lib/store";
import { Document, Client } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Save, ChevronLeft, Bold, Italic, Underline, Type } from "lucide-react";

const AGREEMENT_TEMPLATES = {
  rent: {
    title: "Rent Agreement",
    content: `<div><strong>TENANCY AGREEMENT</strong></div><div><br></div><div>This agreement is made on [DATE] between <strong>[COMPANY_NAME]</strong> (the "Landlord") and <strong>[CLIENT_NAME]</strong> (the "Tenant").</div><div><br></div><div>1. PREMISES: The Landlord agrees to rent the premises located at [ADDRESS].</div><div>2. TERM: The tenancy shall begin on [START_DATE] and end on [END_DATE].</div><div>3. RENT: The monthly rent is [AMOUNT] MVR, payable on the 1st of each month.</div><div>4. SECURITY DEPOSIT: A deposit of [DEPOSIT] MVR shall be held by the Landlord.</div><div>5. UTILITIES: The Tenant shall be responsible for all utility payments.</div><div>6. MAINTENANCE: The Tenant shall maintain the premises in a clean and sanitary condition.</div><div><br></div><div>Signed by:</div><div><br></div><div>______________________</div><div>Landlord (For [COMPANY_NAME])</div><div><br></div><div>______________________</div><div>Tenant (For [CLIENT_NAME])</div>`
  },
  project: {
    title: "Project Service Agreement",
    content: `<div><strong>SERVICE AGREEMENT</strong></div><div><br></div><div>This Service Agreement is entered into as of [DATE] by and between <strong>[COMPANY_NAME]</strong> (the "Provider") and <strong>[CLIENT_NAME]</strong> (the "Client").</div><div><br></div><div>1. SERVICES: The Provider agrees to provide the following services: [SERVICES_DESCRIPTION].</div><div>2. COMPENSATION: The Client agrees to pay [TOTAL_VALUE] MVR for the completed services.</div><div>3. TIMELINE: The project is expected to be completed by [COMPLETION_DATE].</div><div>4. INTELLECTUAL PROPERTY: Upon full payment, all deliverables become the property of the Client.</div><div>5. CONFIDENTIALITY: Both parties agree to keep project details confidential.</div><div>6. TERMINATION: Either party may terminate this agreement with [NOTICE_PERIOD] days written notice.</div><div><br></div><div>Signed by:</div><div><br></div><div>______________________</div><div>Provider (For [COMPANY_NAME])</div><div><br></div><div>______________________</div><div>Client (For [CLIENT_NAME])</div>`
  },
  custom: {
    title: "Custom Agreement",
    content: "<div>Start typing your agreement here...</div>"
  }
};

export default function AgreementForm({ initialData }: { initialData?: Document }) {
  const router = useRouter();
  const { currentProfile } = useStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [docNumber, setLetterNumber] = useState("");
  const [subject, setSubject] = useState(initialData?.terms || "");
  const [language, setLanguage] = useState<'english' | 'dhivehi'>('english');
  const [templateType, setTemplateType] = useState<'rent' | 'project' | 'custom'>(initialData?.template_type || 'custom');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchClientsAndDocs = async () => {
      const fetchedClients = await getClients();
      setClients(fetchedClients);
      
      const docs = await getDocuments('agreement');

      if (initialData) {
        const initialClient = fetchedClients.find(c => c.id === initialData.client_id);
        setClient(initialClient || null);
        setLetterNumber(initialData.number);
        setSubject(initialData.terms || "");
        setLanguage(initialData.language || 'english');
        setTemplateType(initialData.template_type || 'custom');
        if (editorRef.current) {
          editorRef.current.innerHTML = initialData.notes || "";
        }
      } else {
        const maxNumber = docs.reduce((max, d) => {
          const currentNum = parseInt(d.number.split('-').pop() || "0", 10);
          return isNaN(currentNum) ? max : Math.max(max, currentNum);
        }, 0);
        setLetterNumber(`AGR-${new Date().getFullYear()}-${(maxNumber + 1).toString().padStart(3, '0')}`);
      }
    };
    fetchClientsAndDocs();
  }, [initialData]);

  const handleTemplateChange = (type: 'rent' | 'project' | 'custom') => {
    setTemplateType(type);
    if (!initialData || confirm("Changing templates will overwrite your current text. Continue?")) {
      let content = AGREEMENT_TEMPLATES[type].content;
      if (currentProfile) content = content.replace(/\[COMPANY_NAME\]/g, currentProfile.name);
      if (client) content = content.replace(/\[CLIENT_NAME\]/g, client.name);
      content = content.replace(/\[DATE\]/g, new Date().toLocaleDateString());
      
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
      setSubject(AGREEMENT_TEMPLATES[type].title);
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleSave = async () => {
    if (!currentProfile || !client) return;
    setIsSaving(true);

    try {
      const bodyHtml = editorRef.current?.innerHTML || "";
      const newDoc: Document = {
        id: initialData?.id || uuidv4(),
        profile_id: currentProfile.id,
        type: 'agreement',
        number: docNumber,
        client_id: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: client.address,
        items: [],
        taxRate: 0,
        date: initialData?.date || new Date().toISOString(),
        status: initialData?.status || 'draft',
        currency: 'MVR',
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        notes: bodyHtml,
        terms: subject,
        language: language,
        template_type: templateType,
      };

      await saveDocument(newDoc);
      router.push('/agreements');
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isThaana = language === 'dhivehi';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{initialData ? 'Edit Agreement' : 'New Agreement'}</h1>
            <p className="text-muted-foreground text-sm">Draft professional contracts and legal documents.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!client || isSaving} className="rounded-full px-6">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Agreement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader className="py-4">
              <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Select Client</Label>
                <Select value={client?.id} onValueChange={(id) => setClient(clients.find(c => c.id === id) || null)}>
                  <SelectTrigger className="bg-white/5 border-white/5 h-9 text-xs">
                    <SelectValue placeholder="Choose client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Template Type</Label>
                <Select value={templateType} onValueChange={(v: any) => handleTemplateChange(v)}>
                  <SelectTrigger className="bg-white/5 border-white/5 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent Agreement</SelectItem>
                    <SelectItem value="project">Project Agreement</SelectItem>
                    <SelectItem value="custom">Blank Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Language</Label>
                <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                  <SelectTrigger className="bg-white/5 border-white/5 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="dhivehi">Dhivehi (Thaana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold">Agreement Ref #</Label>
                <Input value={docNumber} onChange={e => setLetterNumber(e.target.value)} className="bg-white/5 border-white/5 h-9 text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader className="py-4">
              <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Editor Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')} title="Bold">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')} title="Italic">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')} title="Underline">
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-bold opacity-50">Font Size</Label>
                <Select onValueChange={(v) => execCommand('fontSize', v)}>
                  <SelectTrigger className="h-8 text-[10px] bg-white/5">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Small</SelectItem>
                    <SelectItem value="3">Normal</SelectItem>
                    <SelectItem value="4">Medium</SelectItem>
                    <SelectItem value="5">Large</SelectItem>
                    <SelectItem value="6">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="overflow-hidden shadow-2xl border-none">
            <CardContent className="p-0">
              <div className={cn(
                "bg-white p-16 font-serif text-black min-h-[1000px] flex flex-col shadow-inner",
                isThaana ? 'thaana-font' : ''
              )}>
                {isThaana && <div className="text-center text-sm mb-10 text-black">بِسْمِ اللَّـهِ الرَّހْمَـٰنِ الرَّހީމް</div>}
                
                {currentProfile?.letterhead_url ? (
                  <img src={currentProfile.letterhead_url} alt="Letterhead" className="w-full mb-12" />
                ) : (
                  <header className={cn("flex justify-between items-start mb-12", isThaana ? 'text-right' : 'text-left text-black')}>
                    <div className={isThaana ? 'text-right' : 'text-left'}>
                      <h2 className="text-xl font-bold text-slate-950 leading-tight">{currentProfile?.name}</h2>
                      <p className="text-[11px] text-slate-700 font-medium">{currentProfile?.address}</p>
                    </div>
                    {currentProfile?.logo_url && <img src={currentProfile?.logo_url} alt="Logo" className="h-16 w-auto" />}
                  </header>
                )}

                <Input 
                  placeholder="Agreement Title / Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={cn(
                    "text-lg font-black border-0 border-b border-slate-100 rounded-none px-0 h-12 focus-visible:ring-0 text-slate-900 bg-transparent mb-8",
                    isThaana ? 'text-right' : 'text-left uppercase tracking-tight'
                  )}
                  dir={isThaana ? 'rtl' : 'ltr'}
                />

                <div
                  ref={editorRef}
                  contentEditable
                  className={cn(
                    "flex-grow outline-none text-xs leading-relaxed text-slate-900 font-medium bg-transparent min-h-[600px]",
                    isThaana ? 'text-right' : 'text-left'
                  )}
                  dir={isThaana ? 'rtl' : 'ltr'}
                />

                <footer className="mt-16 text-black border-t border-slate-100 pt-8">
                  <div className="grid grid-cols-2 gap-20">
                    <div className={cn(isThaana ? 'text-right order-2' : 'text-left')}>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mb-8">For the First Party:</p>
                      {currentProfile?.signature_url && (
                        <img src={currentProfile.signature_url} alt="Signature" className="h-12 w-auto mb-2" />
                      )}
                      <div className="border-t border-slate-300 pt-2 w-full">
                        <p className="font-bold text-xs text-slate-950">{currentProfile?.authorized_signatory || currentProfile?.name}</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Authorized Signatory</p>
                      </div>
                    </div>
                    <div className={cn(isThaana ? 'text-right order-1' : 'text-left')}>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mb-8">For the Second Party:</p>
                      <div className="h-12"></div>
                      <div className="border-t border-slate-300 pt-2 w-full">
                        <p className="font-bold text-xs text-slate-950">{client?.name || '______________________'}</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Party Representative</p>
                      </div>
                    </div>
                  </div>
                  {currentProfile?.seal_url && (
                    <div className="flex justify-center mt-8">
                      <img src={currentProfile.seal_url} alt="Seal" className="h-24 w-24 opacity-80" />
                    </div>
                  )}
                </footer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
