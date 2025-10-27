type VerticalLayoutProps = {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
};

export default function VerticalLayout({ sidebar, topbar, children }: VerticalLayoutProps) {
  return (
    <div className="grid h-dvh grid-rows-[auto_1fr]">
      <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        {topbar}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-full overflow-y-auto border-r border-zinc-200 bg-white p-4 lg:block dark:border-zinc-800 dark:bg-zinc-900">
          {sidebar}
        </aside>
        <main className="h-full overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
