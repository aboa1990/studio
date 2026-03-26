import EditBOQForm from "./EditBOQForm";

export const dynamic = 'force-dynamic';

export default async function EditBOQPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditBOQForm />;
}
