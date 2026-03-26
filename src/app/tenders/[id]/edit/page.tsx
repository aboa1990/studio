import EditTenderForm from "./EditTenderForm";

export const dynamic = 'force-dynamic';

export default async function EditTenderPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditTenderForm />;
}
