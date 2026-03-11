
"use client";

import { useEffect, useState } from 'react';
import { getDocuments, deleteDocument } from '@/lib/store';
import { Document } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export default function LettersClient() {
  const router = useRouter();
  const [letters, setLetters] = useState<Document[]>([]);

  useEffect(() => {
    const fetchLetters = async () => {
      const allDocs = await getDocuments();
      const letterDocs = allDocs.filter(doc => doc.type === 'letter');
      setLetters(letterDocs);
    };
    fetchLetters();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this letter?')) {
      const success = await deleteDocument(id);
      if (success) {
        setLetters(letters.filter(letter => letter.id !== id));
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Letters</h1>
        <Button onClick={() => router.push('/letters/new')}>New Letter</Button>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letters.map(letter => (
                <TableRow key={letter.id}>
                  <TableCell>{letter.number}</TableCell>
                  <TableCell>{letter.clientName}</TableCell>
                  <TableCell>{letter.terms}</TableCell>
                  <TableCell>{new Date(letter.date).toLocaleDateString()}</TableCell>
                  <TableCell><Badge>{letter.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/letters/edit/${letter.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(letter.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
