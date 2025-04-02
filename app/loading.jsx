'use client'

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 text-blue-600"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="12" r="2" />
            <path d="M15 8h2" />
            <path d="M15 12h2" />
            <path d="M15 16h2" />
          </svg>
        </div>
      </div>
      <h2 className="mt-8 text-xl font-medium text-gray-700">Loading</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm text-center">
        Please wait while we prepare the application...
      </p>
    </div>
  )
}