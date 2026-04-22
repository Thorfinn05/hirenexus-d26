"use client"

import * as React from "react"
import {
  LayoutDashboard,
  UserCircle,
  Video,
  Settings,
  Github,
  Users,
  Target
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
import { motion } from "framer-motion"

const navigation = [
  { name: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
  { name: "My Profile", href: "/candidate/profile", icon: UserCircle },
  { name: "AI Resume Panel", href: "/candidate/resume-analysis", icon: Users },
  { name: "Skill Gap & Roadmap", href: "/candidate/skill-gap", icon: Target },
  { name: "GitHub Analysis", href: "/candidate/github", icon: Github },
  { name: "Mock Interviews", href: "/candidate/mock-interview", icon: Video },
]

const systemItems = [
  { name: "Settings", href: "/candidate/settings", icon: Settings },
]

export function CandidateSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-white/[0.04] bg-background/60 backdrop-blur-2xl" collapsible="icon">
      <SidebarHeader className="p-4 h-14 flex items-center justify-center group-data-[state=expanded]:justify-start">
        <Link href="/candidate/dashboard" className="flex items-center gap-3 group/logo">
          <div className="h-9 w-9 flex items-center justify-center shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] shadow-lg shadow-black/20 group-hover/logo:border-white/[0.15] transition-all duration-300">
            <img src="/logo.png" alt="HireNexus Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-lg tracking-tight font-headline group-data-[state=collapsed]:hidden overflow-hidden whitespace-nowrap text-foreground/90">
            HireNexus
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2 group-data-[state=collapsed]:hidden">
            Candidate Hub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-0.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={`w-full justify-start gap-3.5 px-3 py-5 rounded-xl transition-all duration-200 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center relative overflow-hidden ${isActive
                        ? "bg-white/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/80"
                        }`}
                    >
                      <Link href={item.href}>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute left-0 top-[20%] bottom-[20%] w-[2px] rounded-full bg-primary"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${isActive ? "text-primary" : ""}`} />
                        <span className="font-medium text-[13px] tracking-tight group-data-[state=collapsed]:hidden">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto mb-4">
          <SidebarGroupLabel className="px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50 mb-2 group-data-[state=collapsed]:hidden">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-0.5">
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className="w-full justify-start gap-3.5 px-3 py-5 rounded-xl text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/80 transition-all duration-200 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="font-medium text-[13px] tracking-tight group-data-[state=collapsed]:hidden">{item.name}</span>
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
