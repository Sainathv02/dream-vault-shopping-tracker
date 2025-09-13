import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dream Vault - Premium Shopping Tracker',
  description: 'Where luxury meets desire. Curate, track, and conquer your ultimate wishlist.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        {children}
      </body>
    </html>
  )
}
