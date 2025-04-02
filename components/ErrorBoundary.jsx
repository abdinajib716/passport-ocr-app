'use client'

import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg bg-red-50 border border-red-100 p-6 my-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h2>
          </div>
          
          <div className="mb-4">
            <p className="text-red-600 mb-2">
              An error occurred while rendering this component.
            </p>
            {this.state.error && (
              <div className="bg-white rounded p-3 border border-red-200 font-mono text-sm text-red-800 overflow-auto">
                {this.state.error.toString()}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded transition-colors"
            >
              Try again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded border transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 