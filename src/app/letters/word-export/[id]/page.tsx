
import { Document, Packer, Paragraph, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { getDocuments, useStore } from "@/lib/store";
import { useEffect } from "react";

const WordExportPage = ({ params }: { params: { id: string } }) => {
  const { currentProfile } = useStore();

  useEffect(() => {
    const generateDocx = async () => {
      if (!currentProfile) return;

      const letterDocs = await getDocuments('letter');
      const letter = letterDocs.find(doc => doc.id === params.id);

      if (!letter) return;

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: await fetch(currentProfile.letterhead_url).then(res => res.blob()),
                  transformation: {
                    width: 600,
                    height: 150,
                  },
                }),
              ],
            }),
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph(""), // Spacing
            new Paragraph({
              children: [
                new ImageRun({
                  data: await fetch(currentProfile.signature_url).then(res => res.blob()),
                  transformation: {
                    width: 150,
                    height: 75,
                  },
                }),
              ],
            }),
          ],
        }],
      });

      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `Letter-${letter.number}.docx`);
      });
    };

    generateDocx();
  }, [currentProfile, params.id]);

  return <div>Generating Word document...</div>;
};

export default WordExportPage;
