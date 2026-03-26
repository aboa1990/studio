import BOQDetail from "./BOQDetail";

export const dynamic = 'force-dynamic';

export default async function BOQDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <BOQDetail />;
}
