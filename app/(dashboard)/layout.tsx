import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/header"

const mockUser = {
  id: "1",
  name: "Admin User",
  email: "admin@grandstay.com",
  role: "ADMIN" as const,
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          userRole={mockUser.role}
          userName={mockUser.name}
          userEmail={mockUser.email}
        />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-5 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
