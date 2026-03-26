import InvoiceDetail from "./InvoiceDetail";

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <InvoiceDetail />;
}
