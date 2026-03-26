import LetterDetailClient from "./LetterDetailClient";

export default async function LetterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LetterDetailClient id={id} />;
}
