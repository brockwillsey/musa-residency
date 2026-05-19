"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
    </SessionProvider>
  )
}