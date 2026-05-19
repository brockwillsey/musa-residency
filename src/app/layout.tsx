import type { Metadata } from "next"
import { Providers } from "@/components/Providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Musa Residency — Home Exchange for Creatives",
  description:
    "A curated home exchange platform connecting culturally-minded remote workers with inspiring spaces worldwide.",
  keywords: [
    "home exchange",
    "creative residency",
    "remote work",
    "artist housing",
    "travel",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}