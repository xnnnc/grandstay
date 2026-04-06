"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pathLabels: Record<string, string> = {
  "": "Dashboard",
  rooms: "Odalar",
  reservations: "Rezervasyonlar",
  guests: "Misafirler",
  "check-in": "Check-in",
  "check-out": "Check-out",
  billing: "Faturalar",
  housekeeping: "Kat Hizmetleri",
  concierge: "Concierge",
  reports: "Raporlar",
  hotels: "Oteller",
  staff: "Personel",
}

function getStaggerStyle(index: number, offset = 0): React.CSSProperties {
  return {
    animationDelay: `${index * 45 + offset}ms`,
  }
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()

  // Split pathname into segments, filter empty strings
  const segments = pathname.split("/").filter(Boolean)

  // Build crumbs: always start with Dashboard root
  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/" },
  ]

  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = pathLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
    crumbs.push({ label, href })
  })

  // If we're on the root, only show Dashboard as current page (no link)
  if (pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="breadcrumb-item-enter font-medium text-foreground">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <BreadcrumbSeparator
                  className="breadcrumb-separator-enter text-muted-foreground/60 [&>svg]:size-3"
                  style={getStaggerStyle(index)}
                />
              )}
              <BreadcrumbItem className="breadcrumb-item-enter" style={getStaggerStyle(index, 20)}>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
