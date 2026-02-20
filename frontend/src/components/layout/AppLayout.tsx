import type { ReactNode } from "react";

interface AppLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppLayout({ sidebar, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-60 shrink-0 border-r border-border/60 bg-[var(--color-sidebar-bg)] flex flex-col shadow-[1px_0_8px_-2px_rgba(0,0,0,0.06)]">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,oklch(0.94_0.02_250/0.3),transparent_70%)]">
        {children}
      </main>
    </div>
  );
}
