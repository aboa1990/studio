
"use client"

import { useEffect, useState } from "react"
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Download, 
  Upload,
  FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getLibraryDocuments, saveLibraryDocument, deleteLibraryDocument, getActiveProfileId } from "@/lib/store"
import { LibraryDocument } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"

export default function DocumentLibraryPage() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<LibraryDocument[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    setDocs(getLibraryDocuments())
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: LibraryDocument = {
          id: uuidv4(),
          profileId: getActiveProfileId(),
          name: file.name,
          type: file.type,
          data: reader.result as string,
          category: "General",
          uploadedAt: new Date().toISOString()
        };
        saveLibraryDocument(newDoc);
        setDocs(getLibraryDocuments());
        toast({
          title: "Document Uploaded",
          description: `${file.name} added to your library.`,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this library document?")) {
      deleteLibraryDocument(id);
      setDocs(getLibraryDocuments());
      toast({
        title: "Document Removed",
        description: "The document has been deleted from your library.",
      });
    }
  }

  const downloadDoc = (doc: LibraryDocument) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  }

  const filteredDocs = docs.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || d.category === filter;
    return matchesSearch && matchesFilter;
  })

  const categories = Array.from(new Set(docs.map(d => d.category)));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-black tracking-tight">Document Library</h1>
          <p className="text-muted-foreground mt-1 text-lg">Store common company documents for quick access in tenders.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Label htmlFor="library-upload" className="cursor-pointer">
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              <Upload className="mr-2 size-4" /> Upload Files
            </div>
            <input 
              id="library-upload" 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border-none shadow-lg bg-card/50 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Doc name..." 
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="border-none shadow-lg bg-card/50 group hover:ring-2 hover:ring-primary/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="size-6" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => downloadDoc(doc)}>
                      <Download className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-bold text-sm truncate">{doc.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    <span>{doc.category}</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocs.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <FolderOpen className="mx-auto size-16 text-muted-foreground/20" />
              <div className="space-y-1">
                <p className="font-bold text-muted-foreground">No documents found</p>
                <p className="text-sm text-muted-foreground/60">Upload your company registration, licenses, and profile here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { Label } from "@/components/ui/label"
