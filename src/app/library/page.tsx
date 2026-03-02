"use client"

import { useEffect, useState } from "react"
import { 
  Search, 
  FileText, 
  Trash2, 
  Download, 
  Upload,
  FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Library</h1>
          <p className="text-muted-foreground text-lg">Store company documents for quick access.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Label htmlFor="library-upload" className="cursor-pointer">
            <div className="inline-flex items-center justify-center rounded-full text-sm font-black tracking-tight ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-white/90 h-10 px-6 shadow-xl shadow-white/5">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="md:col-span-1 glass-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Doc name..." 
                  className="pl-9 bg-white/5 border-white/5 rounded-xl"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white/5 border-white/5 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Documents</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="glass-card group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/5 group-hover:bg-white/10 transition-colors">
                    <FileText className="size-6" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-white/10" onClick={() => downloadDoc(doc)}>
                      <Download className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-9 rounded-xl hover:bg-destructive/20 text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base truncate text-white">{doc.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-[0.15em]">
                    <span>{doc.category}</span>
                    <span className="opacity-30">•</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocs.length === 0 && (
            <div className="col-span-full py-24 text-center space-y-6">
              <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <FolderOpen className="size-10 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-xl">No documents found</p>
                <p className="text-muted-foreground">Upload your registration, licenses, and certificates.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
