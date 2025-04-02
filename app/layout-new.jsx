import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Passport OCR Data Extraction',
  description: 'Upload passport documents and extract data with advanced OCR technology',
  keywords: ['passport', 'OCR', 'data extraction', 'document processing'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
