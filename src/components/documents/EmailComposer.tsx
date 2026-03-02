
"use client"

import { useState } from "react"
import { Mail, Loader2, Copy, Check } from "lucide-react"
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
import { Document } from "@/lib/types"
import { getCompanyDetails } from "@/lib/store"
import { composeInvoiceEmail } from "@/ai/flows/ai-compose-invoice-email-flow"
import { useToast } from "@/hooks/use-toast"

interface EmailComposerProps {
  document: Document;
}

export default function EmailComposer({ document: doc }: EmailComposerProps) {
  const { toast } = useToast()
  const company = getCompanyDetails()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState({ subject: "", body: "" })
  const [copied, setCopied] = useState(false)

  const generateEmail = async () => {
    setLoading(true)
    try {
      const result = await composeInvoiceEmail({
        documentType: doc.type as 'invoice' | 'quotation',
        clientName: doc.clientName,
        documentNumber: doc.number,
        dueDate: doc.dueDate,
        totalAmount: doc.total,
        currency: doc.currency,
        companyName: company.name,
        senderName: "Billing Dept",
        customInstructions: "Please mention that bank transfer is the preferred payment method.",
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
        <Button variant="outline" className="w-full sm:w-auto">
          <Mail className="mr-2 h-4 w-4" /> AI Draft Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Compose Professional Email</DialogTitle>
          <DialogDescription>
            Draft a personalized message for this {doc.type} using AI.
          </DialogDescription>
        </DialogHeader>

        {!email.subject ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Ready to generate a professional email draft for {doc.clientName}?
            </p>
            <Button onClick={generateEmail} disabled={loading} className="bg-accent text-accent-foreground">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Generate Draft
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={email.subject} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea 
                className="min-h-[250px]" 
                value={email.body} 
                onChange={e => setEmail(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
          {email.subject && (
            <>
              <Button variant="ghost" onClick={generateEmail} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerate"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copy Content
                </Button>
                <Button className="bg-primary text-primary-foreground" onClick={() => setIsOpen(false)}>
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
