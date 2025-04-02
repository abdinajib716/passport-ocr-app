'use client'

import React, { useState } from 'react'
import { ScanLine, ChevronRight, Copy, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'

// Component to display confidence level
const ConfidenceBadge = ({ confidence }) => {
  const percent = Math.round(confidence * 100)
  
  let colorClass = 'bg-red-50 text-red-700 border-red-200'
  if (percent >= 90) {
    colorClass = 'bg-green-50 text-green-700 border-green-200'
  } else if (percent >= 70) {
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200'
  }
  
  return (
    <div className="flex items-center gap-2">
      <Progress value={percent} className="w-16 h-1.5" />
      <Badge 
        variant="outline" 
        className={`text-xs font-medium ${colorClass}`}
      >
        {percent}%
      </Badge>
    </div>
  )
}

export default function MRZSection({ mrz1, mrz2 }) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!mrz1?.value && !mrz2?.value) return null

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded">
            <ScanLine className="w-4 h-4 text-blue-600" />
          </div>
          <span>Machine Readable Zone (MRZ)</span>
          
          {(mrz1?.confidence < 0.8 || mrz2?.confidence < 0.8) && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <Info className="w-3 h-3 mr-1" />
              Low confidence
            </Badge>
          )}
        </div>
        <ChevronRight 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="p-4 border-t space-y-4 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">
            The MRZ contains standardized, machine-readable information about the passport and its holder.
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-700">Line 1</div>
              <ConfidenceBadge confidence={mrz1?.confidence || 0} />
            </div>
            <div className="flex items-center justify-between gap-2 bg-white p-3 rounded border group relative">
              <code className="font-mono text-sm">{mrz1?.value || 'N/A'}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 absolute right-2"
                onClick={() => handleCopy(mrz1?.value)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-700">Line 2</div>
              <ConfidenceBadge confidence={mrz2?.confidence || 0} />
            </div>
            <div className="flex items-center justify-between gap-2 bg-white p-3 rounded border group relative">
              <code className="font-mono text-sm">{mrz2?.value || 'N/A'}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 absolute right-2"
                onClick={() => handleCopy(mrz2?.value)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded p-3 text-xs text-blue-800 flex items-start">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5 mr-2" />
            <p>
              MRZ data can be used to validate the passport information. The format follows 
              international standards defined by the International Civil Aviation Organization (ICAO).
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 