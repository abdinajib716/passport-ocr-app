'use client'

import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { 
  ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, RotateCw,
  AlertCircle, FileX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// Set up PDF.js worker source - use a more reliable CDN with HTTPS
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

export default function PDFViewer({ file, onClose }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [renderedScale, setRenderedScale] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    // Reset state when file changes
    setPageNumber(1)
    setScale(1)
    setRotation(0)
    setIsLoading(true)
    setLoadError(null)
  }, [file])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setLoadError(null)
  }

  const onDocumentLoadError = (error) => {
    console.error('PDF loading error:', error)
    setIsLoading(false)
    setLoadError('Could not load PDF document. Please check the file format.')
  }

  // Handle page navigation
  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(numPages, prevPageNumber + offset)))
  }
  
  // Previous page
  const previousPage = () => changePage(-1)
  
  // Next page
  const nextPage = () => changePage(1)
  
  // Handle zoom
  const zoomIn = () => setScale(prevScale => Math.min(3, prevScale + 0.1))
  const zoomOut = () => setScale(prevScale => Math.max(0.5, prevScale - 0.1))
  
  // Handle rotation
  const rotate = () => setRotation(prevRotation => (prevRotation + 90) % 360)

  // Determine if we're using a URL or Blob/File object
  const fileSource = typeof file === 'string' ? file : { data: file, httpHeaders: {} }

  // Error display component
  const ErrorDisplay = ({ error }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50 rounded-lg border border-red-100">
      <div className="p-3 bg-red-100 rounded-full mb-4">
        <FileX className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-red-800 font-medium mb-2">PDF Loading Error</h3>
      <p className="text-red-600 text-center text-sm max-w-md">{error || 'Failed to load PDF document. Please check if the file is valid or try a different PDF.'}</p>
      <Button 
        variant="outline" 
        size="sm"
        className="mt-4 border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </div>
  )

  // Loading indicator
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-t-green-500 border-r-green-300 border-b-green-100 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-green-700">PDF</span>
        </div>
      </div>
      <p className="mt-4 text-gray-600">Loading PDF document...</p>
    </div>
  )

  return (
    <div className="pdf-viewer bg-white">
      {/* Main PDF viewer */}
      <div className="max-w-full overflow-auto">
        {isLoading ? (
          <LoadingIndicator />
        ) : loadError ? (
          <ErrorDisplay error={loadError} />
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between bg-gray-50 p-2 border-b">
              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Zoom and rotation controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-16 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rotate}
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* PDF Document */}
            <div className="flex justify-center p-4 bg-gray-100 min-h-[60vh]">
              <Document
                file={fileSource}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<LoadingIndicator />}
                error={<ErrorDisplay />}
                options={{
                  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
                  cMapPacked: true,
                  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/'
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={<LoadingIndicator />}
                  className="shadow-md"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </>
        )}
      </div>
    </div>
  )
}