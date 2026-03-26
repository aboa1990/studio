'use client';

import { getDocuments, useStore } from '@/lib/store';
import { useEffect, use } from 'react';

const WordExportPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { currentProfile } = useStore();
  const { id } = use(params);

  useEffect(() => {
    const generateDocx = async () => {
      if (!currentProfile) return;

      const {
        Document,
        Packer,
        Paragraph,
        ImageRun,
      } = await import('docx');
      const { saveAs } = await import('file-saver');

      const letterDocs = await getDocuments('letter');
      const letter = letterDocs.find((doc) => doc.id === id);

      if (!letter) return;

      if (!currentProfile.letterhead_url || !currentProfile.signature_url) {
        console.error('Letterhead or signature URL is missing from the profile.');
        return;
      }

      try {
        const letterheadBlob = await fetch(currentProfile.letterhead_url).then(
          (res) => res.blob(),
        );
        const signatureBlob = await fetch(currentProfile.signature_url).then((res) =>
          res.blob(),
        );

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: letterheadBlob,
                      transformation: {
                        width: 600,
                        height: 150,
                      },
                    }),
                  ],
                }),
                new Paragraph(''),
                new Paragraph(''),
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: signatureBlob,
                      transformation: {
                        width: 150,
                        height: 75,
                      },
                    }),
                  ],
                }),
              ],
            },
          ],
        });

        Packer.toBlob(doc).then((blob) => {
          saveAs(blob, `Letter-${letter.number}.docx`);
        });
      } catch (error) {
        console.error('Error generating DOCX file:', error);
      }
    };

    generateDocx();
  }, [currentProfile, id]);

  return (
    <div className="p-20 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
      Generating Word document... If download does not start, please check
      console for errors.
    </div>
  );
};

export default WordExportPage;
