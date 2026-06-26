import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("rounded-lg border border-border bg-card p-4 shadow-sm", className)}>{children}</section>;
}

export function Button({ children, className, ...props }: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: PropsWithChildren<{ tone?: "positive" | "caution" | "danger" | "neutral" }>) {
  const tones = {
    positive: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    caution: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
  };
  return <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function Stat({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {detail ? <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</div> : null}
    </Card>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
    </div>
  );
}
