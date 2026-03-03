
"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ClientForm() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-3xl font-headline font-bold">
          Feature Disabled
        </h1>
      </div>
      <div className="col-span-full py-24 text-center space-y-6">
        <div className="space-y-1">
          <p className="font-bold text-white text-xl">This feature is currently disabled.</p>
        </div>
      </div>
    </div>
  )
}
