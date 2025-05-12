import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ZYNO: Mood2Music',
  description: 'A personalized music recommendation application based on your mood',
  icons: {
    icon: '/music-icon.png', // This will be our custom music icon
    apple: '/music-icon.png',
    shortcut: '/music-icon.png'
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/music-icon.svg" />
        <meta name="theme-color" content="#1DB954" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}