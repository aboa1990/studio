"use client"

import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useStore } from "@/lib/store"

interface EmailComposerProps {
  document: any;
}

export default function EmailComposer({ document: doc }: EmailComposerProps) {
  const { toast } = useToast()
  const { currentProfile: company } = useStore()

  const handleSendGmail = () => {
    if (!company) {
      toast({
        title: "No Company Profile",
        description: "Please select a company profile in settings first.",
        variant: "destructive",
      });
      return;
    }

    const companyName = company.name || "Our Company";
    const docTypeLabel = doc.type.charAt(0).toUpperCase() + doc.type.slice(1);
    
    // Construct Subject
    const subject = `${docTypeLabel} ${doc.number} - ${companyName}`;
    
    // Construct Professional Body
    let body = `Dear ${doc.clientName},\n\n`;
    
    if (doc.type === 'letter') {
      body += `Please find the attached letter regarding: ${doc.terms || 'Our recent communication'}.\n\n`;
    } else {
      body += `Please find attached ${doc.type === 'invoice' ? 'an' : 'a'} ${doc.type} (${doc.number}) for your review.\n\n`;
      
      if (doc.total) {
        body += `Total Amount: ${doc.currency || 'MVR'} ${doc.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
      }
      
      if (doc.dueDate) {
        body += `${doc.type === 'invoice' ? 'Due Date' : 'Valid Until'}: ${new Date(doc.dueDate).toLocaleDateString()}\n`;
      }
    }

    if (doc.type === 'invoice' && company.bank_details) {
      body += `\nPayment can be made to the bank details provided in the document.\n`;
    }

    body += `\nShould you have any questions or require further clarification, please do not hesitate to contact us.\n\n`;
    body += `Best regards,\n\n`;
    body += `${companyName}\n`;
    if (company.email) body += `Email: ${company.email}\n`;
    if (company.phone) body += `Phone: ${company.phone}\n`;

    // Direct Gmail Compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(doc.clientEmail || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(gmailUrl, '_blank');
    
    toast({
      title: "Opening Gmail",
      description: "Gmail composer opened. Remember to attach your PDF file!",
    });
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSendGmail}
      className="w-full sm:w-auto h-8 text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5 transition-all active:scale-95"
    >
      <Mail className="mr-2 h-3.5 w-3.5" /> Send via Gmail
    </Button>
  )
}
