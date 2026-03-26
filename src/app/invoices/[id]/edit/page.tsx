import EditInvoiceForm from "./EditInvoiceForm";

export const dynamic = 'force-dynamic';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  return <EditInvoiceForm />;
}
