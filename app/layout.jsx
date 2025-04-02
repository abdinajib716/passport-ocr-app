import React from 'react'
import { Poppins } from 'next/font/google'
import './globals.css'
import AnimatedLayout from '@/components/AnimatedLayout'
import { Toaster } from 'react-hot-toast'

// Configure Poppins font with only the weights we need
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif'],
  preload: false, // Avoid preloading to prevent timeout errors
})

export const metadata = {
  title: 'Passport OCR Data Extraction',
  description: 'Upload passport documents and extract data with advanced OCR technology',
  keywords: ['passport', 'OCR', 'data extraction', 'document processing'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <AnimatedLayout>
            {children}
          </AnimatedLayout>
          
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
