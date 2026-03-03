
"use client"

import { useEffect, useState } from "react"
import { Plus, Search, FolderOpen, FileText, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getLibraryDocuments, saveLibraryDocument, deleteLibraryDocument } from "@/lib/store"
import { LibraryDocument } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"
import { getActiveProfileId } from "@/lib/store"

export default function DocumentLibraryPage() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<LibraryDocument[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      const documents = await getLibraryDocuments()
      setDocs(documents)
      setLoading(false)
    }
    fetchDocuments()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const newDoc: LibraryDocument = {
          id: uuidv4(),
          profileId: await getActiveProfileId(),
          name: file.name,
          type: file.type,
          data: reader.result as string,
          category: 'General',
          uploadedAt: new Date().toISOString(),
        }
        await saveLibraryDocument(newDoc)
        setDocs(prev => [newDoc, ...prev])
        toast({ title: "Document Uploaded", description: `${file.name} has been added to your library.` })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteLibraryDocument(id)
      setDocs(prev => prev.filter(doc => doc.id !== id))
      toast({ title: "Document Deleted", description: "The document has been removed from your library." })
    }
  }

  const handleDownload = (doc: LibraryDocument) => {
    const link = document.createElement("a");
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocs = docs.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-black tracking-tight">Document Library</h1>
          <p className="text-muted-foreground mt-1">Store and manage your company documents.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Plus className="mr-2 size-4" /> Upload Document
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border bg-card/80">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading documents...</div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="group relative bg-card/60 rounded-lg p-4 space-y-3 border border-border hover:border-primary/50 transition-colors">
                  <FileText className="size-10 text-primary" />
                  <p className="font-semibold text-sm truncate" title={doc.name}>{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                      <Download className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-24 text-center space-y-6">
              <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <FolderOpen className="size-10 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-xl">No documents found</p>
                <p className="text-muted-foreground">Upload your first document to get started.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
