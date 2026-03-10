
"use client"

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Download, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Document, Attachment, CompanyProfile } from "@/lib/types"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { useEffect, useState } from "react"

interface DocumentPreviewProps {
  data: Document;
}

export default function DocumentPreview({ data }: DocumentPreviewProps) {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const { profiles } = useStore();

  useEffect(() => {
    const companyDetails = profiles.find(p => p.id === data.profile_id);
    setCompany(companyDetails || null);
  }, [data.profile_id, profiles]);

  const getDocTitle = () => {
    switch (data.type) {
      case 'invoice': return 'INVOICE';
      case 'quotation': return 'QUOTATION';
      case 'tender': return 'ESTIMATE';
      case 'boq': return 'BILL OF QUANTITIES';
      default: return 'DOCUMENT';
    }
  }

  const getWatermarkText = () => {
    if (data.type === 'tender') return 'ESTIMATE';
    return data.type.toUpperCase();
  }

  const downloadPDF = async () => {
    const element = document.getElementById("document-canvas");
    if (!element) return;

    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true 
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, contentHeight);

    if (data.attachments && data.attachments.length > 0) {
      for (const attachment of data.attachments) {
        if (attachment.type.startsWith('image/')) {
          pdf.addPage();
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`Attachment: ${attachment.name}`, 10, 10);
          
          try {
            const attProps = pdf.getImageProperties(attachment.data);
            const ratio = attProps.width / attProps.height;
            let drawWidth = pdfWidth - 20;
            let drawHeight = drawWidth / ratio;
            
            if (drawHeight > pdfHeight - 30) {
              drawHeight = pdfHeight - 30;
              drawWidth = drawHeight * ratio;
            }
            
            pdf.addImage(attachment.data, 'PNG', 10, 20, drawWidth, drawHeight);
          } catch (e) {
            console.error("Could not add attachment to PDF", e);
          }
        } else {
          pdf.addPage();
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Attached File: ${attachment.name}`, 10, 20);
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`(This file type cannot be rendered directly in the PDF and is stored separately in the app)`, 10, 30);
        }
      }
    }

    pdf.save(`${data.type.toUpperCase()}-${data.number}.pdf`);
  }

  if (!company) {
    return <div className="p-20 text-center text-muted-foreground">Loading company details...</div>;
  }

  const isBOQ = data.type === 'boq';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">{getDocTitle()}</h1>
          <p className="text-muted-foreground">Ref: {data.number}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${data.type}s/${data.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button onClick={downloadPDF} className="bg-primary text-primary-foreground">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Card id="document-canvas" className="bg-white text-black p-12 shadow-xl border-none max-w-4xl mx-auto rounded-none min-h-[1123px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
          <div className="flex gap-6 items-start">
            {company.logo_url && (
              <div className="size-24 shrink-0">
                <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{company.name}</div>
              <div className="text-slate-500 text-sm whitespace-pre-line leading-relaxed">
                {company.address}<br />
                Email: {company.email}<br />
                Phone: {company.phone}<br />
                {company.gst_number && `GST: ${company.gst_number}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4 leading-none">
              {getWatermarkText()}
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Date:</span> {new Date(data.date).toLocaleDateString()}
            </div>
            <div className="text-sm">
              <span className="font-bold text-slate-500">Number:</span> <span className="font-bold">{data.number}</span>
            </div>
            {data.dueDate && (
              <div className="text-sm">
                <span className="text-slate-400">Due Date:</span> {new Date(data.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-12">
          <div className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">
            {(data.type === 'tender' || data.type === 'boq') ? 'Agency / Authority:' : 'Bill To:'}
          </div>
          <div className="text-xl font-bold text-slate-800">{data.clientName}</div>
          <div className="text-slate-500 whitespace-pre-line">{data.clientAddress}</div>
          <div className="text-slate-500 mt-1">{data.clientEmail}</div>
        </div>

        {/* Items Table */}
        <div className="flex-1">
          {isBOQ ? (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">PRICING SUMMARY</h2>
              {/* ... BOQ Table ... */}
            </div>
          ) : (
            <>
              <table className="w-full mb-12">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="text-left py-4 font-bold text-sm uppercase">Description</th>
                    <th className="text-center py-4 font-bold text-sm uppercase">Qty</th>
                    <th className="text-right py-4 font-bold text-sm uppercase">Rate</th>
                    <th className="text-right py-4 font-bold text-sm uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-4 text-slate-700">{item.description}</td>
                      <td className="text-center py-4 text-slate-700">{item.quantity}</td>
                      <td className="text-right py-4 text-slate-700">{data.currency} {item.price.toFixed(2)}</td>
                      <td className="text-right py-4 font-medium text-slate-900">
                        {data.currency} {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{data.currency} {data.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST ({data.taxRate}%):</span>
                    <span>{data.currency} {data.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black border-t-2 border-slate-900 pt-3">
                    <span>Total:</span>
                    <span>{data.currency} {data.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notes Section */}
        {data.notes && (
            <div className="mb-12">
                <div className="text-slate-900 font-bold text-sm mb-2 border-b border-slate-200 pb-1 uppercase tracking-wider">NOTES</div>
                <div className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">
                    {data.notes}
                </div>
            </div>
        )}

        {/* Bank & Payment Info */}
        {data.type === 'invoice' && company.bank_details && (
            <div className="bg-slate-50 p-4 rounded mb-8 border border-slate-100 text-sm">
                <div className="text-slate-900 font-bold text-sm mb-2 border-b border-slate-200 pb-1 uppercase tracking-wider">BANK DETAILS</div>
                <div className="text-slate-600 whitespace-pre-line">
                    {company.bank_details}
                </div>
            </div>
        )}

        {/* Terms and Conditions */}
        {data.terms && (
          <div className="mb-12">
            <div className="text-slate-900 font-bold text-sm mb-2 border-b border-slate-200 pb-1 uppercase tracking-wider">TERMS & CONDITIONS</div>
            <div className="text-xs text-slate-500 whitespace-pre-line leading-relaxed italic">
              {data.terms}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="flex justify-end mb-8">
            <div className="text-center min-w-[200px] flex flex-col items-center">
                {company.signature_url && (
                    <div className="h-16 w-40 mb-2">
                        <img src={company.signature_url} alt="Signature" className="h-full w-full object-contain" />
                    </div>
                )}
                <div className="border-t border-slate-300 pt-1 w-full">
                    <div className="text-sm font-bold text-slate-900">{company.authorized_signatory || "Authorized Signatory"}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Authorized Signature</div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-100 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          Thank you for choosing {company.name}
        </div>
      </Card>
    </div>
  )
}
