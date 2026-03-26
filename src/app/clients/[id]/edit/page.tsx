import EditClientForm from "./EditClientForm";

export const dynamic = 'force-dynamic';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditClientForm />;
}
