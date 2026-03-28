
import AgreementDetail from "./AgreementDetail";

export const dynamic = 'force-dynamic';

export default async function AgreementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgreementDetail />;
}
