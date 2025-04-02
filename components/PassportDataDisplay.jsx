'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MRZSection from '@/components/MRZSection'
import toast from 'react-hot-toast'
import { getFlagEmoji, getCountryName } from '@/utils/countries'
import { 
  Globe, CreditCard, User, Calendar, MapPin, User2, CalendarCheck, 
  CalendarX, Copy, Printer, CheckCircle, AlertTriangle, Shield,
  Download, Info, BarChart4, FileDown, Undo2
} from 'lucide-react'

// Format date strings as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    // Support for multiple date formats
    let date;
    if (typeof dateString === 'string') {
      // Check if the date is in YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      // Check if the date is in DD/MM/YYYY format
      else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/').map(Number);
        date = new Date(year, month - 1, day);
      }
      // Default parsing
      else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Handle invalid date
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString || 'N/A'; // Return original string if formatting fails
  }
}

// Format a value, handling dates if needed
const formatValue = (value, isDate = false) => {
  if (!value) return 'N/A'
  
  // Handle date fields
  if (isDate) {
    return formatDate(value)
  }
  
  return value
}

// Badge to show expiry warning if date is near or passed
const ExpiryWarning = ({ date, fieldType }) => {
  // Only show expiry warnings for actual expiry dates
  if (!date || fieldType !== 'expiry_date') return null;
  
  try {
    // Parse the date string safely
    const parsedDate = parseDate(date);
    if (!parsedDate) return null;
    
    const now = new Date();
    
    // Calculate difference in months
    const diffMonths = Math.floor((parsedDate - now) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 0) {
      return (
        <div className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Expired
        </div>
      );
    } else if (diffMonths < 6) {
      return (
        <div className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          Expires soon
        </div>
      );
    }
  } catch (e) {
    console.error("Date parsing error:", e);
  }
  
  return null;
};

// Helper to safely parse dates in multiple formats
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try standard format first
  const result = new Date(dateStr);
  if (!isNaN(result)) return result;
  
  // Try DD MMM YYYY format (e.g., "06 Feb 2028")
  const dateParts = dateStr.split(' ');
  if (dateParts.length === 3) {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const day = parseInt(dateParts[0], 10);
    const month = months[dateParts[1]];
    const year = parseInt(dateParts[2], 10);
    
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  
  return null;
}

// Function to determine if a document is expired based only on its expiry date
const getDocumentStatus = (expiryDateValue) => {
  if (!expiryDateValue) return { status: 'unknown', text: 'Unknown' };

  try {
    const parsedDate = parseDate(expiryDateValue);
    if (!parsedDate) return { status: 'unknown', text: 'Unknown' };
    
    const now = new Date();
    const diffMonths = Math.floor((parsedDate - now) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 0) {
      return { status: 'expired', text: 'Expired' };
    } else if (diffMonths < 6) {
      return { status: 'warning', text: `Expires in ${diffMonths} months` };
    } else {
      return { status: 'valid', text: 'Valid' };
    }
  } catch (error) {
    console.error("Expiry calculation error:", error);
    return { status: 'unknown', text: 'Unknown' };
  }
};

// Generic data field display component
const DataField = ({ label, data, icon: Icon }) => {
  // Skip if no data
  if (!data) return null
  
  // Extract value and confidence from different data formats
  let value, confidence
  
  if (typeof data === 'string') {
    value = data
  } else if (data.value !== undefined) {
    value = data.value
    // We don't use confidence in the UI as per requirements
  } else if (Array.isArray(data) && data.length > 0) {
    // Handle arrays (like given names)
    value = data.map(item => item.value || '').filter(Boolean).join(' ')
  }
  
  // Don't render if no value
  if (!value) return null
  
  // Format the value (handle dates)
  const displayValue = label?.toLowerCase().includes('date') ? formatValue(value, true) : formatValue(value)
  
  // Determine the field type for proper expiry handling
  const fieldType = 
    label.toLowerCase().includes('expiry') ? 'expiry_date' : 
    label.toLowerCase().includes('issue') ? 'issue_date' : 
    label.toLowerCase().includes('birth') ? 'birth_date' : 
    'other';
  
  return (
    <div className="relative">
      <div 
        className="bg-white rounded-lg border border-gray-100 hover:border-green-100 hover:shadow-sm transition-all overflow-hidden"
      >
        <div className="flex">
          {/* Icon container */}
          <div className="bg-gray-50 flex items-center justify-center p-2 sm:p-3 border-r border-gray-100">
            {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />}
          </div>
          
          {/* Content */}
          <div className="flex flex-1 flex-col justify-center p-2 sm:px-4 sm:py-3 overflow-hidden">
            <div className="flex justify-between items-center">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-0.5 sm:mb-1">
                {label}
              </p>
              
              {/* Special handling for dates */}
              {label?.toLowerCase().includes('date') && value && <ExpiryWarning date={value} fieldType={fieldType} />}
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm sm:text-base font-medium text-gray-900 whitespace-normal break-words pr-4 min-w-0 max-w-full">
                {displayValue}
              </p>
              
              {/* Copy icon - only show for certain fields */}
              {!label?.toLowerCase().includes('date') && (
                <button 
                  className="text-gray-400 hover:text-green-500 transition-colors focus:outline-none flex-shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(value)
                    toast.success(`${label} copied to clipboard`)
                  }}
                  title="Copy to clipboard"
                >
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Display country with flag emoji
const CountryField = ({ data }) => {
  if (!data?.value) return null

  // Get flag and name with error handling
  let flag = '🏳️' // Default flag if there's an error
  let name = data.value
  
  try {
    flag = getFlagEmoji(data.value)
    name = getCountryName(data.value)
  } catch (error) {
    console.error('Error processing country data:', error)
  }

  return (
    <div className="relative p-4 group transition-colors hover:bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-md">
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Country</div>
            <div className="flex items-center gap-2">
              <span 
                className="text-2xl inline-block" 
                role="img" 
                aria-label={`Flag of ${name}`}
              >
                {flag}
              </span>
              <span className="font-medium text-gray-900">
                {name} ({data.value})
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(data.value)
                  toast.success("Country code copied!")
                }}
                className="text-gray-400 hover:text-blue-500 p-1 rounded-md hover:bg-blue-50"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="hidden"></div>
      </div>
    </div>
  )
}

export default function PassportDataDisplay({ data, onReset }) {
  const p = data?.prediction || {}
  const hasMrz = p.mrz1?.value || p.mrz2?.value
  
  // Calculate expiry status only from the expiry_date field
  const expiryStatus = useMemo(() => {
    if (!p.expiry_date?.value) return null;
    return getDocumentStatus(p.expiry_date.value);
  }, [p.expiry_date]);
  
  // Extract country data
  const countryData = useMemo(() => {
    if (!p.country?.value) return null
    const name = getCountryName(p.country.value)
    const code = p.country.value
    return { name, code }
  }, [p.country])

  // Handle case where we don't have passport data
  if (!p || Object.keys(p).length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center animate-fadeIn">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-red-100 rounded-full animate-pulse">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
          </div>
        </div>
        <h3 className="text-red-900 font-medium text-base sm:text-lg mb-1 sm:mb-2">No Passport Data</h3>
        <p className="text-red-600 text-sm sm:text-base mb-3 sm:mb-4">There was a problem processing the document.</p>
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors text-sm sm:text-base"
          size="sm"
        >
          <Undo2 className="h-3 w-3" />
          New Scan
        </Button>
      </div>
    )
  }

  return (
    <Card className="card-gradient animate-fadeIn shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 sm:p-5 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Globe className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Passport Information
            </CardTitle>
            <CardDescription className="text-blue-100 mt-0.5 sm:mt-1 text-xs sm:text-sm">
              {countryData && (
                <span className="flex items-center">
                  <span className="mr-1">{getFlagEmoji(countryData.code)}</span>
                  {countryData.name}
                </span>
              )}
            </CardDescription>
          </div>
          
          {expiryStatus && (
            <div className={`status-badge ${expiryStatus.status} animate-pulse-shadow text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5`}>
              {expiryStatus.text}
            </div>
          )}
        </div>
      </CardHeader>
      
      <Tabs defaultValue="personal" className="w-full">
        <div className="px-3 sm:px-4 pt-2 sm:pt-3">
          <TabsList className="w-full bg-gray-100 p-0.5 sm:p-1">
            <TabsTrigger value="personal" className="flex-1 animate-slideInRight data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-1 sm:py-1.5" style={{ animationDelay: '0.1s' }}>
              <User size={12} className="mr-1 sm:mr-1.5 hidden sm:inline" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="document" className="flex-1 animate-slideInRight data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-1 sm:py-1.5" style={{ animationDelay: '0.2s' }}>
              <CreditCard size={12} className="mr-1 sm:mr-1.5 hidden sm:inline" />
              Document
            </TabsTrigger>
            {hasMrz && (
              <TabsTrigger value="mrz" className="flex-1 animate-slideInRight data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm py-1 sm:py-1.5" style={{ animationDelay: '0.3s' }}>
                <Shield size={12} className="mr-1 sm:mr-1.5 hidden sm:inline" />
                MRZ Data
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <TabsContent value="personal" className="animate-slideInUp">
          <CardContent className="p-3 sm:p-4 pt-4 sm:pt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DataField label="Given Names" data={p.given_names} icon={User} />
            <DataField label="Surname" data={p.surname} icon={User2} />
            <DataField label="ID Number" data={p.id_number} icon={CreditCard} />
            <DataField label="Date of Birth" data={p.birth_date} icon={Calendar} />
            <DataField label="Birth Place" data={p.birth_place} icon={MapPin} />
            <DataField 
              label="Gender" 
              data={{
                value: p.gender?.value || null, 
                confidence: p.gender?.confidence || 0
              }} 
              icon={User} 
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="document" className="animate-slideInUp">
          <CardContent className="p-3 sm:p-4 pt-4 sm:pt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DataField label="Issuing Country" data={p.country} icon={Globe} />
            <DataField label="Authority" data={p.authority} icon={CreditCard} />
            <DataField label="Issue Date" data={p.issuance_date} icon={CalendarCheck} />
            <DataField label="Expiry Date" data={p.expiry_date} icon={CalendarX} />
          </CardContent>
        </TabsContent>
        
        {hasMrz && (
          <TabsContent value="mrz" className="animate-slideInUp">
            <CardContent className="p-3 sm:p-4 pt-4 sm:pt-5">
              <div className="bg-gray-50 p-3 rounded-md mb-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Machine Readable Zone</p>
                {p.mrz1 && p.mrz1.value && (
                  <div className="font-mono text-xs bg-white p-2 rounded border border-gray-200 mb-2 overflow-x-auto">
                    {p.mrz1.value}
                  </div>
                )}
                {p.mrz2 && p.mrz2.value && (
                  <div className="font-mono text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                    {p.mrz2.value}
                  </div>
                )}
              </div>
              <MRZSection mrz1={p.mrz1?.value} mrz2={p.mrz2?.value} />
            </CardContent>
          </TabsContent>
        )}
      </Tabs>
      
      <div className="p-4 flex justify-end border-t border-gray-100">
        <Button 
          onClick={onReset} 
          className="bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <Undo2 className="h-4 w-4 mr-2" />
          New Scan
        </Button>
      </div>
    </Card>
  )
} 