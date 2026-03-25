
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
import { usePathname, useRouter } from "next/navigation"
import { useStore } from "@/lib/store"

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
    title: "Letters",
    url: "/letters",
    icon: FileText,
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

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profiles, currentProfile, fetchProfiles, setCurrentProfile } = useStore();

  React.useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar">
      <SidebarHeader className="h-20 flex flex-col justify-center px-4 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-muted hover:bg-muted/50 transition-colors rounded-xl h-12"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-muted/80 to-muted/50 border text-foreground shadow-lg">
                {currentProfile?.logo_url ? <img src={currentProfile?.logo_url} alt={currentProfile?.name} className="rounded-md"/> : <Building2 className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-[11px] leading-tight group-data-[collapsible=icon]:hidden ml-2">
                <span className="font-bold truncate">
                  {currentProfile?.name || 'My Company'}
                </span>
                <span className="truncate text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {currentProfile?.address ? currentProfile.address.substring(0, 15) + '...' : 'Maldives Entity'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-3 group-data-[collapsible=icon]:hidden opacity-40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl glass-card p-2"
            align="start"
            side="bottom"
            sideOffset={12}
          >
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 py-2 px-2">
              Switch Business
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profiles.map(profile => (
              <DropdownMenuItem
                key={profile.id}
                className="gap-3 p-2 rounded-lg focus:bg-muted cursor-pointer mb-1"
                onClick={() => setCurrentProfile(profile)}
              >
                <div className="flex size-7 items-center justify-center rounded-lg border bg-background">
                 {profile.logo_url ? <img src={profile.logo_url} alt={profile.name} className="rounded-sm"/> : <Building2 className="size-3 shrink-0" />}
                </div>
                <span className="font-semibold text-xs">{profile.name}</span>
                {currentProfile?.id === profile.id && <Check className="ml-auto size-3 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                setCurrentProfile(null);
                router.push('/settings');
              }}
              className="flex items-center gap-3 p-2 rounded-lg focus:bg-muted mt-1 cursor-pointer"
            >
              <PlusCircle className="size-3.5" />
              <span className="font-semibold text-xs">Add New Profile</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      
      <SidebarContent className="py-4 px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 px-4">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`h-9 rounded-xl px-3 transition-all duration-200 ${pathname === item.url 
                        ? "bg-muted text-foreground font-bold shadow-sm" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`size-4 transition-colors ${pathname === item.url ? "text-foreground" : "text-muted-foreground"}`} />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3 px-4">Fast Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Invoice" className="h-9 rounded-xl px-3 group/btn hover:bg-muted/50 border hover:border-border transition-all">
                  <Link href="/invoices/new" className="font-semibold text-xs">
                    <PlusCircle className="text-primary group-hover:scale-110 transition-transform size-4" />
                    <span>New Invoice</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New BOQ" className="h-9 rounded-xl px-3 group/btn hover:bg-muted/50 border hover:border-border transition-all">
                  <Link href="/boqs/new" className="font-semibold text-xs">
                    <PlusCircle className="text-primary group-hover:scale-110 transition-transform size-4" />
                    <span>New BOQ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 group">
          <div className="size-8 rounded-xl bg-gradient-to-br from-muted/80 to-muted/50 flex items-center justify-center border shadow-inner">
            <Sparkles className="size-4 text-foreground group-hover:rotate-12 transition-transform" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="font-black text-lg tracking-tighter">ForgeDocs</p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Professional</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
