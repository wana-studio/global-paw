import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Refiq New Tab — تبويبة جديدة هادئة',
  description:
    'Refiq is a minimal, calm new tab dashboard for Arab users. Hijri calendar, AI chatbot, weather, and more — all in Arabic & English.',
  openGraph: {
    title: 'Refiq New Tab',
    description: 'A calm new tab experience, built for Arab users.',
    type: 'website',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
