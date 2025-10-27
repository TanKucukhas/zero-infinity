import { Inter } from "next/font/google";
import AppThemeProvider from "@/contexts/theme-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Intel",
  description: "Admin panel for people enrichment and management",
  icons: {
    icon: [
      "/favicon/favicon.ico",
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [
      "/favicon/apple-touch-icon.png"
    ],
    shortcut: [
      "/favicon/favicon.ico"
    ]
  },
  manifest: "/favicon/site.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased`}>
        <AppThemeProvider>
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
