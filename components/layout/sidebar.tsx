"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  House,
  Bed,
  CalendarCheck,
  Users,
  SignIn,
  SignOut as SignOutIcon,
  Receipt,
  Broom,
  CallBell,
  ChartBar,
  UserCircleGear,
  Key,
  DotsThreeVertical,
} from "@phosphor-icons/react"
import { logoutAction } from "@/actions/auth"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserRole = "ADMIN" | "MANAGER" | "RECEPTIONIST" | "HOUSEKEEPING" | "CONCIERGE"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "ANA",
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: House,
        roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING", "CONCIERGE"],
      },
    ],
  },
  {
    label: "OPERASYONLAR",
    items: [
      {
        label: "Odalar",
        href: "/rooms",
        icon: Bed,
        roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
      },
      {
        label: "Rezervasyonlar",
        href: "/reservations",
        icon: CalendarCheck,
        roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
      },
      {
        label: "Misafirler",
        href: "/guests",
        icon: Users,
        roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
      },
      {
        label: "Check-in",
        href: "/check-in",
        icon: SignIn,
        roles: ["ADMIN", "RECEPTIONIST"],
      },
      {
        label: "Check-out",
        href: "/check-out",
        icon: SignOutIcon,
        roles: ["ADMIN", "RECEPTIONIST"],
      },
    ],
  },
  {
    label: "HİZMETLER",
    items: [
      {
        label: "Faturalar",
        href: "/billing",
        icon: Receipt,
        roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
      },
      {
        label: "Kat Hizmetleri",
        href: "/housekeeping",
        icon: Broom,
        roles: ["ADMIN", "MANAGER", "HOUSEKEEPING"],
      },
      {
        label: "Concierge",
        href: "/concierge",
        icon: CallBell,
        roles: ["ADMIN", "CONCIERGE"],
      },
    ],
  },
  {
    label: "YÖNETİM",
    items: [
      {
        label: "Raporlar",
        href: "/reports",
        icon: ChartBar,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        label: "Personel",
        href: "/staff",
        icon: UserCircleGear,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
]

interface AppSidebarProps {
  userRole: UserRole
  userName: string
  userEmail: string
}

function isPathActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")
}

export function AppSidebar({ userRole, userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [optimisticHref, setOptimisticHref] = React.useState<string | null>(null)
  const [isLoggingOut, startLogout] = React.useTransition()

  // Clear optimistic state when pathname catches up
  React.useEffect(() => {
    setOptimisticHref(null)
  }, [pathname])

  // The "visual" active href: optimistic click target during transition, real pathname otherwise
  const activeHref = isPending && optimisticHref ? optimisticHref : null

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0)

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Yönetici",
    MANAGER: "Müdür",
    RECEPTIONIST: "Resepsiyonist",
    HOUSEKEEPING: "Kat Hizmetleri",
    CONCIERGE: "Concierge",
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Already on this page — no need to navigate
    if (isPathActive(href, pathname)) return

    e.preventDefault()
    setOptimisticHref(href)
    startTransition(() => {
      router.push(href)
    })
  }

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAction()
    })
  }

  return (
    <Sidebar collapsible="icon">
      {/* Logo / Branding */}
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:justify-center">
          <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30">
            <span className="font-bold text-primary-foreground text-sm tracking-tight select-none">
              G
            </span>
            <div className="absolute inset-0 rounded-xl ring-1 ring-primary/20" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-none text-foreground tracking-tight truncate">
              GrandStay
            </span>
            <span className="text-[10px] leading-none text-muted-foreground mt-0.5 truncate tracking-wide uppercase">
              Hotel Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-1">
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 px-2 mb-0.5">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = activeHref
                    ? isPathActive(item.href, activeHref)
                    : isPathActive(item.href, pathname)
                  const isLoading = isPending && optimisticHref === item.href
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "h-9 rounded-xl px-2.5 transition-all duration-200 ease-out",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                            : "hover:bg-muted/70 text-sidebar-foreground/80 hover:text-foreground"
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="flex items-center gap-3 py-1.5"
                        >
                          <Icon
                            size={20}
                            weight={isActive ? "fill" : "regular"}
                            className={cn(
                              "shrink-0 transition-transform duration-200",
                              isLoading && "animate-pulse"
                            )}
                          />
                          <span className="text-[15px] font-medium truncate">
                            {item.label}
                          </span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={cn(
                                "ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — user info + actions */}
      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:justify-center rounded-lg px-1 py-1 hover:bg-muted/70 transition-colors">
              <Avatar size="default" className="shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[13px] font-medium text-foreground leading-none mb-0.5 text-left">
                  {userName}
                </span>
                <span className="truncate text-[10px] text-muted-foreground leading-none text-left">
                  {roleLabels[userRole]}
                </span>
              </div>
              <DotsThreeVertical size={16} className="shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel className="pb-1">
              <p className="font-medium text-foreground text-sm">{userName}</p>
              <p className="text-muted-foreground text-xs font-normal mt-0.5">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Key size={14} className="text-muted-foreground" />
              Şifre Değiştir
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onSelect={handleLogout}
            >
              <SignOutIcon size={14} />
              {isLoggingOut ? "Çıkış yapılıyor..." : "Oturumu Kapat"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
