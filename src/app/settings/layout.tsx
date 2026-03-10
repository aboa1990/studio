
"use client"

import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { useStore } from "@/lib/store"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchProfiles, currentProfile } = useStore()

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header profile={currentProfile} />
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
