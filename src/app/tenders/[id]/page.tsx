import TenderDetail from "./TenderDetail";

export const dynamic = 'force-dynamic';

export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <TenderDetail />;
}
