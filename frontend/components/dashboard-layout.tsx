"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Award,
  PlusCircle,
  Settings,
  HelpCircle,
  LogOut,
  Users,
} from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Proposals",
      href: "/proposals",
      icon: FileText,
    },
    {
      title: "Treasury",
      href: "/treasury",
      icon: DollarSign,
    },
    {
      title: "Staking",
      href: "/staking",
      icon: Award,
    },
    {
      title: "Create DAO",
      href: "/create",
      icon: PlusCircle,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="lg:w-64 md:w-56 sm:w-14">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="rounded-full bg-primary p-1 text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-bold hidden sm:inline">SuiDAO Governance</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Help">
                  <Link href="/help" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Help</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-3 sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto">
              <ConnectWalletButton />
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
