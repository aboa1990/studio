
import { getDocument } from "@/lib/store";
import LetterForm from "@/components/letters/LetterForm";

export default async function EditLetterPage({ params }: { params: { id: string } }) {
  const letter = await getDocument(params.id);

  if (!letter) {
    return <div>Letter not found</div>;
  }

  return <LetterForm initialData={letter} />;
}
