import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import AnimatedHeader from '@/components/AnimatedLayout'
import { Toaster } from 'react-hot-toast'

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
          <AnimatedHeader>
            {children}
          </AnimatedHeader>
          
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                maxWidth: '90vw',
                padding: '12px',
                borderRadius: '8px'
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}
