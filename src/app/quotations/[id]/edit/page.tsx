import EditQuotationForm from "./EditQuotationForm";

export const dynamic = 'force-dynamic';

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditQuotationForm />;
}
