import { Toaster } from '#/components/ui/sonner'

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
