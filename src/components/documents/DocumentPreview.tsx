
"use client"

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Download, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Document } from "@/lib/types"
import { getCompanyDetails } from "@/lib/store"
import Link from "next/link"
import Image from "next/image"

interface DocumentPreviewProps {
  data: Document;
}

export default function DocumentPreview({ data }: DocumentPreviewProps) {
  const company = getCompanyDetails();

  const downloadPDF = async () => {
    const element = document.getElementById("document-canvas")
    if (!element) return

    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${data.type.toUpperCase()}-${data.number}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">{data.type.toUpperCase()} View</h1>
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
            {company.logoUrl && (
              <div className="relative size-20 shrink-0">
                <Image src={company.logoUrl} alt={company.name} fill className="object-contain" />
              </div>
            )}
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{company.name}</div>
              <div className="text-slate-500 text-sm whitespace-pre-line leading-relaxed">
                {company.address}<br />
                Email: {company.email}<br />
                Phone: {company.phone}<br />
                {company.gstNumber && `GST: ${company.gstNumber}`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-slate-200 tracking-tighter opacity-50 uppercase mb-4">
              {data.type}
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Date:</span> {new Date(data.date).toLocaleDateString()}
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Number:</span> <span className="font-bold">{data.number}</span>
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
          <div className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Bill To:</div>
          <div className="text-xl font-bold text-slate-800">{data.clientName}</div>
          <div className="text-slate-500">{data.clientEmail}</div>
        </div>

        {/* Items Table */}
        <div className="flex-1">
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="text-left py-4 font-bold text-sm uppercase">Description</th>
                <th className="text-center py-4 font-bold text-sm uppercase">Qty</th>
                <th className="text-right py-4 font-bold text-sm uppercase">Price</th>
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

          {/* Summary */}
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
        </div>

        {/* Bank & Payment Info */}
        {(company.bankDetails?.bankName || company.bankDetails?.accountNumber) && (
          <div className="bg-slate-50 p-6 rounded mb-6 border border-slate-100">
            <div className="text-slate-900 font-bold text-sm mb-4 border-b border-slate-200 pb-2">BANK TRANSFER DETAILS</div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Bank Name</span>
                <span className="font-semibold text-slate-700">{company.bankDetails?.bankName || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Account Name</span>
                <span className="font-semibold text-slate-700">{company.bankDetails?.accountName || company.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Account Number</span>
                <span className="font-bold text-lg text-slate-900">{company.bankDetails?.accountNumber || "N/A"}</span>
              </div>
              {company.bankDetails?.branchName && (
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Branch</span>
                  <span className="font-semibold text-slate-700">{company.bankDetails?.branchName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        {data.terms && (
          <div className="mb-8">
            <div className="text-slate-900 font-bold text-sm mb-2 border-b border-slate-200 pb-1">TERMS & CONDITIONS</div>
            <div className="text-xs text-slate-500 whitespace-pre-line leading-relaxed italic">
              {data.terms}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-slate-100 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          Thank you for choosing {company.name}
        </div>
      </Card>
    </div>
  )
}
