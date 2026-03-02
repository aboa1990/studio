
"use client"

import * as React from "react"
import {
  FileText,
  LayoutDashboard,
  Quote,
  Settings,
  PlusCircle,
  BarChart3,
  Check,
  ChevronsUpDown,
  Building2,
  Briefcase,
  Users
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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [profiles, setProfiles] = React.useState<CompanyProfile[]>([])
  const [activeProfileId, setActiveId] = React.useState("")

  React.useEffect(() => {
    const loadProfiles = () => {
      setProfiles(getProfiles())
      setActiveId(getActiveProfileId())
    }
    
    loadProfiles()
    window.addEventListener('profileChanged', loadProfiles)
    return () => window.removeEventListener('profileChanged', loadProfiles)
  }, [])

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0]

  const handleProfileSwitch = (id: string) => {
    setActiveProfileId(id);
    setActiveId(id);
    window.location.reload(); 
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-20 flex flex-col justify-center px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  {activeProfile?.name || "Select Profile"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Switch Company
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Company Profiles
            </DropdownMenuLabel>
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleProfileSwitch(profile.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                {profile.name}
                {profile.id === activeProfileId && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 p-2">
                <PlusCircle className="size-4" />
                <span>Manage Profiles</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Invoice">
                  <Link href="/invoices/new" className="text-primary hover:text-primary">
                    <PlusCircle />
                    <span>Create Invoice</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Quotation">
                  <Link href="/quotations/new" className="text-accent hover:text-accent">
                    <PlusCircle />
                    <span>Create Quotation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="New Tender">
                  <Link href="/tenders/new" className="text-emerald-500 hover:text-emerald-400">
                    <PlusCircle />
                    <span>Create Tender</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <span className="font-headline font-bold text-lg group-data-[collapsible=icon]:hidden">ForgeDocs</span>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
