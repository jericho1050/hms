import type React from "react"
import "./global.css";
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { NavBar } from "@/components/nav-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Hospital Management System",
  description: "A modern hospital management system built with Next.js and Supabase",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-grow">{children}</main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


