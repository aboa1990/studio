
import QuotationDetail from "./QuotationDetail";

export const dynamic = 'force-dynamic';

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuotationDetail />;
}
