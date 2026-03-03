
"use client"

import * as React from "react"
import {
  FileText,
  LayoutDashboard,
  Quote,
  Settings,
  PlusCircle,
  Check,
  ChevronsUpDown,
  Building2,
  Briefcase,
  Users,
  FolderOpen,
  ClipboardList,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProfiles, getActiveProfileId, setActiveProfileId } from "@/lib/store"
import { CompanyProfile } from "@/lib/types"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileText,
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: Quote,
  },
  {
    title: "BOQs",
    url: "/boqs",
    icon: ClipboardList,
  },
  {
    title: "Tenders & Bids",
    url: "/tenders",
    icon: Briefcase,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Doc Library",
    url: "/library",
    icon: FolderOpen,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [profiles, setProfiles] = React.useState<CompanyProfile[]>([])
  const [activeProfileId, setActiveId] = React.useState("")

  const loadProfiles = React.useCallback(async () => {
    try {
      const fetchedProfiles = await getProfiles();
      const fetchedActiveId = await getActiveProfileId();
      setProfiles(fetchedProfiles);
      setActiveId(fetchedActiveId);
    } catch (error) {
      console.error("Sidebar load error:", error);
    }
  }, []);

  React.useEffect(() => {
    loadProfiles()
    if (typeof window !== 'undefined') {
      window.addEventListener('profileChanged', loadProfiles)
      return () => window.removeEventListener('profileChanged', loadProfiles)
    }
  }, [loadProfiles])

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0]

  const handleProfileSwitch = (id: string) => {
    setActiveProfileId(id);
    setActiveId(id);
    if (typeof window !== 'undefined') {
      window.location.reload(); 
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-sidebar">
      <SidebarHeader className="h-24 flex flex-col justify-center px-4 border-b border-white/5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/5 hover:bg-white/[0.03] transition-colors rounded-xl h-14"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-white shadow-lg">
                <Building2 className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-3">
                <span className="truncate font-bold text-white">
                  {activeProfile?.name || "Select Profile"}
                </span>
                <span className="truncate text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Maldives Entity
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden opacity-40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl glass-card p-2"
            align="start"
            side="bottom"
            sideOffset={12}
          >
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 py-3 px-2">
              Switch Business
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleProfileSwitch(profile.id)}
                className="gap-3 p-2 rounded-lg focus:bg-white/5 cursor-pointer mb-1"
              >
                <div className={`flex size-8 items-center justify-center rounded-lg border ${profile.id === activeProfileId ? 'bg-white border-white text-black' : 'border-white/10 text-white'}`}>
                  <Building2 className="size-4 shrink-0" />
                </div>
                <span className="font-semibold text-sm">{profile.name}</span>
                {profile.id === activeProfileId && (
                  <Check className="ml-auto size-4 text-emerald-400" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-3 p-2 rounded-lg focus:bg-white/5 mt-1">
                <PlusCircle className="size-4" />
                <span className="font-semibold text-sm">Add New Profile</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      
      <SidebarContent className="py-6 px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 px-4">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`h-11 rounded-xl px-4 transition-all duration-200 ${
                      pathname === item.url 
                        ? "bg-white/5 text-white font-bold shadow-sm" 
                        : "hover:bg-white/[0.03] text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`size-5 transition-colors ${pathname === item.url ? "text-white" : "text-muted-foreground"}`} />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 px-4">Fast Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Invoice" className="h-10 rounded-xl px-4 group/btn hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                  <Link href="/invoices/new" className="text-white font-semibold">
                    <PlusCircle className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>New Invoice</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New BOQ" className="h-10 rounded-xl px-4 group/btn hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                  <Link href="/boqs/new" className="text-white font-semibold">
                    <PlusCircle className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>New BOQ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Quotation" className="h-10 rounded-xl px-4 group/btn hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                  <Link href="/quotations/new" className="text-white font-semibold">
                    <PlusCircle className="text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>New Quote</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-6 border-t border-white/5">
        <div className="flex items-center gap-4 group">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5 shadow-inner">
            <Sparkles className="size-5 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-black text-xl tracking-tighter text-white">ForgeDocs</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Professional</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
