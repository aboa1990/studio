import LetterDetailClient from "./LetterDetailClient";

export default function LetterDetailPage({ params }: { params: { id: string } }) {
  return <LetterDetailClient id={params.id} />;
}
