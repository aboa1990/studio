
"use client"

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Download, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Document, Attachment, CompanyProfile, TemplateStyle } from "@/lib/types"
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

  const getActiveTemplate = (): TemplateStyle => {
    if (!company) return 'modern';
    if (data.type === 'invoice') return company.invoice_template || 'modern';
    if (data.type === 'quotation') return company.quotation_template || 'modern';
    return 'modern';
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
  const template = getActiveTemplate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-headline font-bold">{getDocTitle()}</h1>
          <p className="text-muted-foreground text-sm">Ref: {data.number} | Template: <span className="capitalize">{template}</span></p>
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
        "print:p-10 print:shadow-none print:m-0 print:max-w-none print:min-h-0",
        template === 'minimal' && "p-8"
      )}>
        {/* Header Section */}
        {template === 'classic' ? (
          <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-center">
            <div>
              <div className="text-4xl font-black text-slate-950 mb-1">{getWatermarkText()}</div>
              <div className="text-xs font-bold text-slate-600">REF NO: {data.number}</div>
            </div>
            {company.logo_url && (
              <img src={company.logo_url} alt={company.name} className="h-20 w-auto" />
            )}
          </div>
        ) : template === 'minimal' ? (
          <div className="mb-12 border-b border-slate-100 pb-8">
            <div className="text-2xl font-black mb-4">{company.name}</div>
            <div className="flex justify-between items-end">
              <div className="text-[10px] text-slate-600 max-w-xs">
                {company.address}
              </div>
              <div className="text-right text-[10px]">
                <div className="font-bold uppercase tracking-widest text-slate-400 mb-1">{getWatermarkText()}</div>
                <div>{data.number}</div>
                <div>{new Date(data.date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {/* Company Info for Classic & Minimal */}
        {template === 'classic' && (
          <div className="grid grid-cols-2 gap-8 mb-10 text-[11px]">
            <div>
              <div className="font-black text-slate-900 uppercase mb-2">From:</div>
              <div className="font-bold text-slate-950">{company.name}</div>
              <div className="text-slate-700">{company.address}</div>
              <div className="text-slate-700">T: {company.phone}</div>
              <div className="text-slate-700">E: {company.email}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-slate-900 uppercase mb-2">Document Details:</div>
              <div><span className="font-bold">Date:</span> {new Date(data.date).toLocaleDateString()}</div>
              {data.dueDate && <div><span className="font-bold">Due Date:</span> {new Date(data.dueDate).toLocaleDateString()}</div>}
              {company.gst_number && <div><span className="font-bold">GST:</span> {company.gst_number}</div>}
            </div>
          </div>
        )}

        {/* Client Info */}
        <div className={cn(
          "mb-10 text-black",
          template === 'classic' && "bg-slate-50 p-6 rounded-none border-l-4 border-slate-900"
        )}>
          <div className="text-slate-600 uppercase text-[9px] font-bold tracking-widest mb-1">
            {(data.type === 'tender' || data.type === 'boq') ? 'Agency / Authority:' : 'Bill To:'}
          </div>
          <div className="text-lg font-bold text-slate-900">{data.clientName}</div>
          <div className="text-slate-700 text-[11px] whitespace-pre-line">{data.clientAddress}</div>
          <div className="text-slate-700 text-[11px] mt-0.5 font-medium">{data.clientEmail}</div>
        </div>

        {/* Items Table */}
        <div className="flex-1 text-black">
          <table className="w-full mb-10 border-collapse">
            <thead>
              <tr className={cn(
                "border-b-2 border-slate-950",
                template === 'classic' && "bg-slate-900 text-white"
              )}>
                {isBOQ && <th className={cn("text-left py-3 px-2 font-bold text-[10px] uppercase", template === 'classic' ? "text-white" : "text-slate-950")}>Cost Code</th>}
                <th className={cn("text-left py-3 px-2 font-bold text-[10px] uppercase", template === 'classic' ? "text-white" : "text-slate-950")}>Description</th>
                <th className={cn("text-center py-3 px-2 font-bold text-[10px] uppercase", template === 'classic' ? "text-white" : "text-slate-950")}>Qty</th>
                <th className={cn("text-right py-3 px-2 font-bold text-[10px] uppercase", template === 'classic' ? "text-white" : "text-slate-950")}>Rate</th>
                <th className={cn("text-right py-3 px-2 font-bold text-[10px] uppercase", template === 'classic' ? "text-white" : "text-slate-950")}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={item.id} className={cn(
                  "border-b border-slate-200",
                  template === 'minimal' && "border-slate-100"
                )}>
                  {isBOQ && <td className="py-3 px-2 text-slate-800 text-[11px] font-mono">{item.costCode}</td>}
                  <td className="py-3 px-2 text-slate-800 text-[11px] font-medium">{item.description}</td>
                  <td className="text-center py-3 px-2 text-slate-800 text-[11px] font-medium">{item.quantity}</td>
                  <td className="text-right py-3 px-2 text-slate-800 text-[11px] font-medium">{data.currency} {item.price.toFixed(2)}</td>
                  <td className="text-right py-3 px-2 font-bold text-slate-950 text-[11px]">
                    {data.currency} {(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-10">
            <div className={cn(
              "w-64 space-y-2 text-[11px]",
              template === 'minimal' && "w-48"
            )}>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Subtotal:</span>
                <span className="text-slate-900">{data.currency} {data.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-medium">
                <span>GST ({data.taxRate}%):</span>
                <span className="text-slate-900">{data.currency} {data.taxAmount.toFixed(2)}</span>
              </div>
              <div className={cn(
                "flex justify-between text-lg font-black border-t-2 border-slate-950 pt-2",
                template === 'classic' && "bg-slate-50 p-2 border-t-4"
              )}>
                <span>Total:</span>
                <span className="text-slate-950">{data.currency} {data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-black">
          <div className="space-y-6">
            {data.notes && (
              <div>
                <div className="text-slate-950 font-bold text-[10px] mb-1.5 border-b border-slate-200 pb-0.5 uppercase tracking-wider">NOTES</div>
                <div className="text-[10px] text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {data.notes}
                </div>
              </div>
            )}
            {data.terms && (
              <div>
                <div className="text-slate-950 font-bold text-[10px] mb-1.5 border-b border-slate-200 pb-0.5 uppercase tracking-wider">TERMS & CONDITIONS</div>
                <div className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed italic font-medium">
                  {data.terms}
                </div>
              </div>
            )}
            {data.type === 'invoice' && company.bank_details && (
              <div className={cn(
                "p-3 rounded border border-slate-200 text-[11px]",
                template === 'classic' ? "bg-slate-900 text-white" : "bg-slate-50 text-black"
              )}>
                <div className={cn("font-bold text-[10px] mb-1.5 border-b pb-0.5 uppercase tracking-wider", template === 'classic' ? "border-slate-700" : "border-slate-200")}>BANK DETAILS</div>
                <div className="whitespace-pre-line font-medium">{company.bank_details}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end items-end">
            <div className="flex items-center gap-8 mb-4">
              {company.seal_url && (
                <img src={company.seal_url} alt="Seal" className="h-24 w-24 object-contain opacity-90" />
              )}
              <div className="text-center min-w-[180px]">
                {company.signature_url && (
                  <img src={company.signature_url} alt="Signature" className="h-14 w-36 mx-auto mb-1 object-contain" />
                )}
                <div className="border-t border-slate-400 pt-1 w-full">
                  <div className="text-[9px] text-slate-600 uppercase tracking-wider font-bold">Authorised Signatory</div>
                  <div className="text-[11px] font-bold text-slate-950 mt-0.5">{company.authorized_signatory || company.name}</div>
                </div>
              </div>
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
