
'use client';

import { Button } from "@/components/ui/button";
import { Document, Packer, Paragraph, ImageRun, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useRouter } from "next/navigation";
import { MoreHorizontal, Download, FileDown, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { Document as LetterDocument } from "@/lib/types";

interface LetterActionsProps {
  letter: LetterDocument;
  handleDelete: () => void;
  handleDownload: () => void;
}

export default function LetterActions({ letter, handleDelete, handleDownload }: LetterActionsProps) {
  const router = useRouter();
  const { currentProfile } = useStore();

  const generateDocx = async () => {
    if (!currentProfile || !currentProfile.letterhead_url || !currentProfile.signature_url) {
      console.error('Profile data is incomplete for DOCX generation.');
      return;
    }

    try {
      const letterheadBlob = await fetch(currentProfile.letterhead_url).then(res => res.blob());
      const signatureBlob = await fetch(currentProfile.signature_url).then(res => res.blob());
      const isDhivehi = letter.language === 'dhivehi';

      const children = [
        new Paragraph({ children: [new ImageRun({ data: letterheadBlob, transformation: { width: 500, height: 100 } })] }),
        new Paragraph(""), new Paragraph(""),
        new Paragraph({
          children: [new TextRun({ text: letter.clientName || '', bold: true })]
        }),
        new Paragraph(letter.clientAddress || ''),
        new Paragraph(""),
        new Paragraph(`LTR/No: ${letter.number}`),
        new Paragraph(`Date: ${new Date(letter.date).toLocaleDateString()}`),
        new Paragraph(""),
        new Paragraph({
          children: [new TextRun({ text: `Subject: ${letter.terms}`, bold: true, size: 24 })]
        }),
        new Paragraph(""),
      ];

      const notes = letter.notes || '';
      notes.split('\n').forEach(line => {
        children.push(new Paragraph({ text: line, style: isDhivehi ? "thaana" : "" }));
      });

      children.push(
        new Paragraph(""), new Paragraph(""),
        new Paragraph("Sincerely,"),
        new Paragraph({ children: [new ImageRun({ data: signatureBlob, transformation: { width: 120, height: 60 } })] }),
        new Paragraph({
          children: [new TextRun({ text: "Authorised Signatory", bold: true, size: 18, color: "888888" })]
        }),
        new Paragraph({
          children: [new TextRun({ text: currentProfile.authorized_signatory || currentProfile.name, bold: true })]
        }),
      )

      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "thaana",
              name: "Thaana",
              basedOn: "Normal",
              next: "Normal",
              run: {
                rightToLeft: true,
                font: "Faruma",
              }
            }
          ]
        },
        sections: [
          {
            children: children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Letter-${letter.number}.docx`);
    } catch (error) {
      console.error("Error generating DOCX file:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={handleDownload} variant="secondary" className="text-xs h-8 font-bold">
        <Download className="size-3.5 mr-2" /> PDF
      </Button>
      <Button size="sm" onClick={generateDocx} variant="secondary" className="text-xs h-8 font-bold">
        <FileDown className="size-3.5 mr-2" /> Word
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push(`/letters/edit/${letter.id}`)} className="text-xs font-bold">
            <Edit className="size-3.5 mr-2" /> Edit Letter
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-xs font-bold text-destructive focus:text-destructive">
            <Trash2 className="size-3.5 mr-2" /> Delete Letter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
