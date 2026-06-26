import Link from "next/link";
import { BarChart3, BookOpen, Calculator, ClipboardList, Gauge, ListOrdered, ShieldCheck, Table2 } from "lucide-react";
import { DISCLAIMER } from "@wheeldesk/core";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/watchlist", label: "Watchlist", icon: Table2 },
  { href: "/csp-screener", label: "CSP Screener", icon: ShieldCheck },
  { href: "/covered-calls", label: "Covered Calls", icon: BarChart3 },
  { href: "/rankings", label: "Rankings", icon: ListOrdered },
  { href: "/trades", label: "Trades", icon: ClipboardList },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/education", label: "Education", icon: BookOpen }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 hidden w-64 border-r border-border bg-card p-4 lg:block">
        <Link href="/dashboard" className="block">
          <div className="text-xl font-semibold">WheelDesk</div>
          <div className="text-xs text-slate-500">Capital-preservation-first research</div>
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="font-semibold">WheelDesk</div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md border border-border px-3 py-1 text-xs">
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
        <footer className="border-t border-border px-4 py-4 text-xs text-slate-500 lg:ml-64 lg:px-8">{DISCLAIMER}</footer>
      </div>
    </div>
  );
}
