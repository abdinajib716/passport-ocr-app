'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'

export default function ToasterProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#059669',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#DC2626',
            color: '#fff',
          },
        },
      }}
    />
  )
}
