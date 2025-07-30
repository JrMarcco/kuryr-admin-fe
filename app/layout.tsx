import type { Metadata } from "next"
import "./globals.css"
import type React from "react"

export const metadata: Metadata = {
  title: "Kuryr 消息中心",
  description: "一个统一的消息管理平台",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
