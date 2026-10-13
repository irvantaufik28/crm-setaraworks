"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/actions/auth";

const primaryNavigation = [
  { href: "/dashboard", label: "Dashboard", code: "01" },
  { href: "/leads", label: "Leads", code: "02" },
  { href: "/pipeline", label: "Pipeline", code: "03" },
  { href: "/follow-ups", label: "Follow-ups", code: "04" },
  { href: "/proposals", label: "Proposals", code: "05" },
  { href: "/reports", label: "Reports", code: "06" },
];

export function AppShell({
  children,
  adminName,
  adminEmail,
}: {
  children: React.ReactNode;
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <header className="mobile-header">
        <Link href="/dashboard" className="brand-mark" aria-label="SetaraWorks CRM dashboard">
          <span>SW</span>
          <strong>CRM</strong>
        </Link>
        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls="crm-navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Tutup" : "Menu"}
        </button>
      </header>

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} id="crm-navigation">
        <div>
          <Link href="/dashboard" className="brand-mark" aria-label="SetaraWorks CRM dashboard" onClick={() => setOpen(false)}>
            <span>SW</span>
            <strong>SetaraWorks CRM</strong>
          </Link>
          <p className="sidebar-label">Sales workspace</p>
          <nav aria-label="Navigasi utama">
            {primaryNavigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
                  <span>{item.code}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <Link href="/settings" className={pathname === "/settings" ? "active" : ""} onClick={() => setOpen(false)}>
            <span>07</span>
            Settings
          </Link>
          <div className="admin-identity">
            <span aria-hidden="true">{adminName.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{adminName}</strong>
              <small>{adminEmail}</small>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="logout-button" type="submit">
              Logout
            </button>
          </form>
        </div>
      </aside>

      {open ? <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Tutup menu" /> : null}
      <main className="crm-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

