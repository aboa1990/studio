"use client"

import { FolderOpen } from "lucide-react"

export default function DocumentLibraryPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Library</h1>
          <p className="text-muted-foreground text-lg">Store company documents for quick access.</p>
        </div>
      </div>

      <div className="col-span-full py-24 text-center space-y-6">
        <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
          <FolderOpen className="size-10 opacity-20" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-white text-xl">No documents found</p>
          <p className="text-muted-foreground">This feature is currently disabled.</p>
        </div>
      </div>
    </div>
  )
}