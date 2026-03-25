
"use client"

import { useState } from "react"
import { Mail, Loader2, Copy, Check, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"
import { draftEmail } from "@/ai/flows/draft-email-flow"

interface EmailComposerProps {
  document: any;
}

export default function EmailComposer({ document: doc }: EmailComposerProps) {
  const { toast } = useToast()
  const { currentProfile: company } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState<{ subject: string; body: string }>({ subject: "", body: "" })
  const [copied, setCopied] = useState(false)

  const generateEmail = async () => {
    setLoading(true)
    if (!company) {
      toast({
        title: "No Company Profile",
        description: "Please select a company profile first.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await draftEmail({
        documentType: doc.type,
        clientName: doc.clientName,
        documentNumber: doc.number,
        dueDate: doc.dueDate,
        totalAmount: doc.total,
        currency: doc.currency,
        companyName: company.name,
        customInstructions: doc.type === 'invoice' ? "Mention that bank transfer is preferred." : "",
      });

      setEmail(result);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate email content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSendGmail = () => {
    if (!email.subject || !email.body) return;
    
    const mailtoUrl = `mailto:${doc.clientEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    window.location.href = mailtoUrl;
    
    setIsOpen(false);
    toast({
      title: "Opening Gmail",
      description: "Redirecting to your default mail client...",
    });
  }

  const copyToClipboard = () => {
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Email content copied to clipboard.",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto h-8 text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5">
          <Mail className="mr-2 h-3.5 w-3.5" /> AI Email Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] glass-card border-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-black tracking-tight">AI Email Composer</DialogTitle>
          <DialogDescription className="text-xs">
            Draft a professional message for this {doc.type} using Cloud Office AI.
          </DialogDescription>
        </DialogHeader>

        {!email.subject ? (
          <div className="py-12 text-center space-y-6">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                <Mail className="size-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">
              Ready to generate a professional email draft for <span className="text-white font-bold">{doc.clientName}</span>?
            </p>
            <Button onClick={generateEmail} disabled={loading || !company} className="rounded-full px-8 h-10 font-bold text-xs shadow-xl shadow-primary/20">
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Mail className="mr-2 h-3.5 w-3.5" />}
              Generate Draft
            </Button>
            {!company && <p className="text-[10px] text-destructive uppercase tracking-widest font-black">Please select a company profile first.</p>}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Subject</Label>
              <Input value={email.subject} onChange={e => setEmail(prev => ({ ...prev, subject: e.target.value }))} className="bg-white/5 border-white/5 text-sm h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Message Body</Label>
              <Textarea 
                className="min-h-[250px] bg-white/5 border-white/5 text-sm leading-relaxed" 
                value={email.body} 
                onChange={e => setEmail(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between items-center w-full border-t border-white/5 pt-6">
          {email.subject && (
            <>
              <Button variant="ghost" onClick={generateEmail} disabled={loading} className="text-[10px] font-bold uppercase tracking-widest h-9">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                Regenerate
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard} className="text-[10px] font-bold uppercase tracking-widest h-9 border-white/10">
                  {copied ? <Check className="h-3.5 w-3.5 mr-2" /> : <Copy className="h-3.5 w-3.5 mr-2" />}
                  Copy
                </Button>
                <Button onClick={handleSendGmail} className="bg-primary text-primary-foreground rounded-full px-6 h-9 font-bold text-[10px] uppercase tracking-widest">
                  <Send className="mr-2 h-3.5 w-3.5" /> Open in Gmail
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
