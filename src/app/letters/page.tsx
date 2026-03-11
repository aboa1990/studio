
import { getDocuments } from "@/lib/store";
import { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function LettersPage() {
  const letters = await getDocuments('letter');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Letters</h1>
        <Button asChild>
          <Link href="/letters/new">New Letter</Link>
        </Button>
      </div>
      {letters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {letters.map((letter: Document) => (
            <div key={letter.id} className="border p-4 rounded-lg shadow-sm">
              <h2 className="font-bold">{letter.clientName}</h2>
              <p className="text-sm text-muted-foreground">{new Date(letter.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No letters yet. Create one!</p>
        </div>
      )}
    </div>
  );
}
