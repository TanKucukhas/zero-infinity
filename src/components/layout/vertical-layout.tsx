type VerticalLayoutProps = {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
};

export default function VerticalLayout({ sidebar, topbar, children }: VerticalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        {topbar}
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-y-auto">
          {sidebar}
        </aside>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
