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
import { PDFDocument } from "pdf-lib"
import { cn } from "@/lib/utils"

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
    const mainPdfDoc = await PDFDocument.create();
    const page = mainPdfDoc.addPage([canvas.width, canvas.height]);
    const pngImage = await mainPdfDoc.embedPng(imgData);
    page.drawImage(pngImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });

    if (data.attachments && data.attachments.length > 0) {
      for (const attachment of data.attachments) {
        if (attachment.type.startsWith('image/')) {
          const imageBytes = await fetch(attachment.data).then(res => res.arrayBuffer());
          let embeddedImage;
          if (attachment.type === 'image/png') {
            embeddedImage = await mainPdfDoc.embedPng(imageBytes);
          } else if (attachment.type === 'image/jpeg') {
            embeddedImage = await mainPdfDoc.embedJpg(imageBytes);
          } else continue;

          const page = mainPdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
          page.drawImage(embeddedImage, { x: 0, y: 0, width: embeddedImage.width, height: embeddedImage.height });

        } else if (attachment.type === 'application/pdf') {
            const pdfBytes = await fetch(attachment.data).then(res => res.arrayBuffer());
            const donorPdfDoc = await PDFDocument.load(pdfBytes);
            const copiedPages = await mainPdfDoc.copyPages(donorPdfDoc, donorPdfDoc.getPageIndices());
            copiedPages.forEach(page => mainPdfDoc.addPage(page));
        }
      }
    }

    const pdfBytes = await mainPdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${data.type.toUpperCase()}-${data.number}.pdf`;
    link.click();
  }

  if (!company) {
    return <div className="p-20 text-center text-muted-foreground">Loading company details...</div>;
  }

  const isBOQ = data.type === 'boq';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-headline font-bold">{getDocTitle()}</h1>
          <p className="text-muted-foreground text-sm">Ref: {data.number}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${data.type}s/${data.id}/edit`}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </Link>
          </Button>
          <Button size="sm" onClick={downloadPDF} className="bg-primary text-primary-foreground">
            <Download className="mr-2 h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>

      <Card id="document-canvas" className={cn(
        "bg-white text-black p-12 shadow-xl border-none max-w-4xl mx-auto rounded-none min-h-[1123px] flex flex-col print-content",
        "print:p-10 print:shadow-none print:m-0 print:max-w-none print:min-h-0"
      )}>
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
          <div className="flex gap-6 items-start">
            {company.logo_url && (
              <div className="size-20 shrink-0">
                <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <div className="text-2xl font-bold text-slate-950 mb-1">{company.name}</div>
              <div className="text-slate-700 text-[11px] whitespace-pre-line leading-relaxed">
                {company.address}<br />
                Email: {company.email}<br />
                Phone: {company.phone}<br />
                {company.gst_number && `GST: ${company.gst_number}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-950 tracking-tighter uppercase mb-2 leading-none">
              {getWatermarkText()}
            </div>
            <div className="text-[10px] text-slate-800">
              <span className="text-slate-600 font-medium">Date:</span> {new Date(data.date).toLocaleDateString()}
            </div>
            <div className="text-[10px] text-slate-950">
              <span className="font-bold text-slate-700">Number:</span> <span className="font-bold">{data.number}</span>
            </div>
            {data.dueDate && (
              <div className="text-[10px] text-slate-800">
                <span className="text-slate-600 font-medium">Due Date:</span> {new Date(data.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-10 text-black">
          <div className="text-slate-600 uppercase text-[9px] font-bold tracking-widest mb-1">
            {(data.type === 'tender' || data.type === 'boq') ? 'Agency / Authority:' : 'Bill To:'}
          </div>
          <div className="text-lg font-bold text-slate-900">{data.clientName}</div>
          <div className="text-slate-700 text-[11px] whitespace-pre-line">{data.clientAddress}</div>
          <div className="text-slate-700 text-[11px] mt-0.5 font-medium">{data.clientEmail}</div>
        </div>

        {/* Items Table */}
        <div className="flex-1 text-black">
          {isBOQ ? (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-950 uppercase tracking-tight mb-3">PRICING SUMMARY</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-950">
                    <th className="text-left py-2 font-bold text-[10px] uppercase text-slate-950">Cost Code</th>
                    <th className="text-left py-2 font-bold text-[10px] uppercase w-2/5 text-slate-950">Description / Element</th>
                    <th className="text-center py-2 font-bold text-[10px] uppercase text-slate-950">Qty</th>
                    <th className="text-right py-2 font-bold text-[10px] uppercase text-slate-950">Rate</th>
                    <th className="text-right py-2 font-bold text-[10px] uppercase text-slate-950">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="py-2 text-slate-800 text-[11px] font-mono">{item.costCode}</td>
                      <td className="py-2 text-slate-800 text-[11px]">{item.description}</td>
                      <td className="text-center py-2 text-slate-800 text-[11px]">{item.quantity}</td>
                      <td className="text-right py-2 text-slate-800 text-[11px]">{data.currency} {item.price.toFixed(2)}</td>
                      <td className="text-right py-2 font-bold text-slate-950 text-[11px]">
                        {data.currency} {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-6">
                <div className="w-64 space-y-2 text-[11px]">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Subtotal:</span>
                    <span className="text-slate-900">{data.currency} {data.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>GST ({data.taxRate}%):</span>
                    <span className="text-slate-900">{data.currency} {data.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t-2 border-slate-950 pt-2 mt-1">
                    <span>Total Value:</span>
                    <span className="text-slate-950">{data.currency} {data.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full mb-10">
                <thead>
                  <tr className="border-b-2 border-slate-950">
                    <th className="text-left py-3 font-bold text-[10px] uppercase text-slate-950">Description</th>
                    <th className="text-center py-3 font-bold text-[10px] uppercase text-slate-950">Qty</th>
                    <th className="text-right py-3 font-bold text-[10px] uppercase text-slate-950">Rate</th>
                    <th className="text-right py-3 font-bold text-[10px] uppercase text-slate-950">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="py-3 text-slate-800 text-[11px] font-medium">{item.description}</td>
                      <td className="text-center py-3 text-slate-800 text-[11px] font-medium">{item.quantity}</td>
                      <td className="text-right py-3 text-slate-800 text-[11px] font-medium">{data.currency} {item.price.toFixed(2)}</td>
                      <td className="text-right py-3 font-bold text-slate-950 text-[11px]">
                        {data.currency} {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-10">
                <div className="w-56 space-y-2 text-[11px]">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Subtotal:</span>
                    <span className="text-slate-950">{data.currency} {data.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>GST ({data.taxRate}%):</span>
                    <span className="text-slate-950">{data.currency} {data.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t-2 border-slate-950 pt-2">
                    <span>Total:</span>
                    <span className="text-slate-950">{data.currency} {data.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notes Section */}
        {data.notes && (
            <div className="mb-10 text-black">
                <div className="text-slate-950 font-bold text-[10px] mb-1.5 border-b border-slate-200 pb-0.5 uppercase tracking-wider">NOTES</div>
                <div className="text-[10px] text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                    {data.notes}
                </div>
            </div>
        )}

        {/* Terms and Conditions */}
        {data.terms && (
          <div className="mb-10 text-black">
            <div className="text-slate-950 font-bold text-[10px] mb-1.5 border-b border-slate-200 pb-0.5 uppercase tracking-wider">TERMS & CONDITIONS</div>
            <div className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed italic font-medium">
              {data.terms}
            </div>
          </div>
        )}

        {/* Bank & Payment Info */}
        {data.type === 'invoice' && company.bank_details && (
            <div className="bg-slate-50 p-3 rounded mb-6 border border-slate-200 text-[11px] text-black">
                <div className="text-slate-950 font-bold text-[10px] mb-1.5 border-b border-slate-200 pb-0.5 uppercase tracking-wider">BANK DETAILS</div>
                <div className="text-slate-800 whitespace-pre-line font-medium">
                    {company.bank_details}
                </div>
            </div>
        )}

        {/* Signature Section */}
        <div className="flex justify-between items-end mb-6 text-black">
          <div>
            {company.seal_url && (
              <div className="h-24 w-24 relative">
                <img src={company.seal_url} alt="Company Seal" className="h-full w-full object-contain opacity-90" />
              </div>
            )}
          </div>
          <div className="text-center min-w-[180px] flex flex-col items-center">
            {company.signature_url && (
              <div className="h-14 w-36 mb-1">
                <img src={company.signature_url} alt="Signature" className="h-full w-full object-contain" />
              </div>
            )}
            <div className="border-t border-slate-400 pt-1 w-full">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">Authorised Signatory</div>
              <div className="text-[11px] font-bold text-slate-950 mt-0.5">{company.authorized_signatory || company.name}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-slate-200 text-center text-slate-600 text-[9px] uppercase tracking-widest font-bold">
          Thank you for choosing {company.name}
        </div>
      </Card>
    </div>
  )
}
