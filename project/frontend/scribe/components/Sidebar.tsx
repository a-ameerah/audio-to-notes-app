"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Upload, BookOpen, Mic, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/audio-files", label: "Audio Files", icon: Mic },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Brand — Impact font */}
        <div className="sidebar-brand">
          <span className="brand-text">Scribe</span>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <p className="sidebar-menu-label">Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "sidebar-nav-item",
                pathname === href && "sidebar-nav-item--active"
              )}
            >
              <Icon className="sidebar-nav-icon" size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <button className="sidebar-logout" id="logout-btn">
          <LogOut className="sidebar-logout-icon" size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
