
'use client';

import { Button } from "@/components/ui/button";
import { Document, Packer, Paragraph, ImageRun, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
        new Paragraph(""), new Paragraph(""), new Paragraph(""), new Paragraph(""), // Add spacing
        new Paragraph(letter.clientName || ''),
        new Paragraph(letter.clientAddress || ''),
        new Paragraph(`Date: ${new Date(letter.date).toLocaleDateString()}`),
        new Paragraph(`Subject: ${letter.terms}`),
        new Paragraph(""), // Spacing
      ];

      // Add notes with line breaks
      const notes = letter.notes || '';
      notes.split('\n').forEach(line => {
        children.push(new Paragraph({ text: line, style: isDhivehi ? "thaana" : "" }));
      });

      children.push(
        new Paragraph(""), new Paragraph(""), new Paragraph(""), // Spacing
        new Paragraph("Sincerely,"),
        new Paragraph({ children: [new ImageRun({ data: signatureBlob, transformation: { width: 150, height: 75 } })] }),
        new Paragraph(currentProfile.authorized_signatory || ''),
        new Paragraph("Authorised Signatory"),
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
                font: "Thaana",
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
    <div>
      <Button onClick={handleDownload} className="mr-2">Download as PDF</Button>
      <Button onClick={generateDocx} className="mr-2">Download as DOCX</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/letters/edit/${letter.id}`)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
