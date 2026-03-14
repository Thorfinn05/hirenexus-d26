"use client"

import * as React from "react"
import {
  LayoutDashboard,
  UserCircle,
  Video,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/candidate/profile", icon: UserCircle },
  { name: "Mock Interviews", href: "/candidate/mock-interview", icon: Video },
]

const systemItems = [
  { name: "Settings", href: "/candidate/settings", icon: Settings },
]

export function CandidateSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-white/5 bg-background/40 backdrop-blur-xl" collapsible="icon">
      <SidebarHeader className="p-4 h-16 flex items-center justify-center group-data-[state=expanded]:justify-start">
        <Link href="/candidate/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-background shadow-md shadow-primary/10">
            <img src="/logo.png" alt="HireNexus Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tighter font-headline group-data-[state=collapsed]:hidden overflow-hidden whitespace-nowrap text-foreground">
            HireNexus
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2 group-data-[state=collapsed]:hidden">
            Candidate Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={`w-full justify-start gap-4 px-3 py-6 rounded-xl transition-all duration-300 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center ${isActive
                        ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:shadow-sm"
                        }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <span className="font-semibold tracking-tight group-data-[state=collapsed]:hidden">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto mb-4">
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2 group-data-[state=collapsed]:hidden">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1.5">
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className="w-full justify-start gap-4 px-3 py-6 rounded-xl text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:shadow-sm transition-all duration-300 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="font-semibold tracking-tight group-data-[state=collapsed]:hidden">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
