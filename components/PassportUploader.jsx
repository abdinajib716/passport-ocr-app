'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileType2, 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  X,
  ArrowRight,
  Camera,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PassportDataDisplay from '@/components/PassportDataDisplay'
import toast from 'react-hot-toast'
import { base64ToUint8Array } from '@/utils/fileHelpers'

// Animation variants for transitions
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const shimmerAnimation = {
  hidden: { backgroundPosition: '200% 0' },
  visible: { 
    backgroundPosition: '-200% 0',
    transition: { 
      repeat: Infinity, 
      duration: 1.5,
      ease: "linear" 
    }
  }
};

export default function PassportUploader({ onDataExtracted }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState(null);
  
  // Reset all state
  const resetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setCurrentStep(0);
    setIsProcessing(false);
    setError(null);
    setProcessedData(null);
    setProgress(0);
    setFileError(null);
    
    // Clear any object URLs to prevent memory leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };
  
  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Reset previous errors
    setError(null);
    setFileError(null);
    setProcessedData(null);
    
    // Handle rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      const { errors } = rejectedFiles[0];
      if (errors[0]?.code === 'file-too-large') {
        setFileError('File is too large. Please upload a file under 5MB');
        toast.error('File is too large. Please upload a file under 5MB');
      } else if (errors[0]?.code === 'file-invalid-type') {
        setFileError('Please upload a valid image (JPG, PNG) or PDF file');
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
      } else {
        setFileError('Invalid file. Please try another.');
        toast.error('Invalid file. Please try another.');
      }
      return;
    }
    
    // Check if we have accepted files
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);
    setCurrentStep(1);
    
    // Provide feedback on successful upload
    toast.success(`${selectedFile.name} selected successfully`);
  }, []);
  
  // Configure dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });
  
  // Process the document with the OCR API
  const processPassport = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(10); // Start progress
    
    // Create a toast notification with loading state
    const toastId = toast.loading('Processing your document...');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Show progress
      setProgress(30);
      
      // Call the API
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(70);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process document');
      }
      
      // Parse the response data
      const data = await response.json();
      setProgress(100);
      
      // Update state with processed data
      setProcessedData(data);
      
      // Notify parent component
      if (onDataExtracted) {
        onDataExtracted(data);
      }
      
      // Show success toast and dismiss the loading toast
      toast.success('Document successfully processed!', { id: toastId });
      
    } catch (err) {
      // Update error state and show error toast
      setError(err.message || 'An error occurred while processing the document');
      toast.error(err.message || 'Failed to process document', { id: toastId });
      console.error('Error processing document:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Cancel the upload/processing
  const handleCancel = () => {
    resetAll();
  };
  
  // Determine which step to render
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderUploadStep();
      case 1:
        return renderPreviewStep();
      default:
        return renderUploadStep();
    }
  };
  
  // Step 1: Upload
  const renderUploadStep = () => {
    return (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="animate-fadeIn"
      >
        <div 
          {...getRootProps()} 
          className={`border-2 ${isDragActive ? 'border-solid' : 'border-dashed'} rounded-lg bg-white transition-all duration-300 transform hover:shadow-md ${
            isDragAccept ? 'border-green-500 bg-green-50' : 
            isDragReject ? 'border-red-500 bg-red-50' : 
            fileError ? 'border-red-300 bg-red-50' :
            isDragActive ? 'border-green-400 bg-green-50 scale-[1.01]' : 
            'border-gray-300 hover:border-green-400 hover:bg-green-50'
          }`}
          aria-label="Passport upload area"
          role="button"
          tabIndex="0"
        >
          <input {...getInputProps({ 'aria-label': 'Upload passport document' })} />
          
          <div className="flex flex-col items-center justify-center p-8 cursor-pointer text-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                isDragAccept ? 'bg-green-100' : 
                isDragReject || fileError ? 'bg-red-100' : 
                'bg-green-50'
              }`}
            >
              {isDragReject || fileError ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Upload className={`h-8 w-8 ${isDragAccept ? 'text-green-500' : 'text-green-600'} ${
                  isDragActive ? 'animate-bounce' : ''
                }`} />
              )}
            </motion.div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive 
                ? isDragAccept 
                  ? 'Drop to upload your document' 
                  : 'This file type is not supported'
                : fileError 
                  ? 'Upload Error' 
                  : 'Upload your passport'
              }
            </h3>
            
            <p className="text-sm text-gray-500 mb-4 max-w-md">
              {fileError ? (
                <span className="text-red-500">{fileError}</span>
              ) : (
                isDragActive ? 
                'Release to upload' : 
                'Drag and drop your passport image or PDF, or click to browse files. We support JPG, PNG, and PDF formats.'
              )}
            </p>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 gap-2 ${
                fileError 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              type="button"
              aria-label={fileError ? "Try another file" : "Select document"}
            >
              <Camera className="h-4 w-4" />
              <span>{fileError ? 'Try Another' : 'Select Document'}</span>
            </motion.button>
            
            <p className="text-xs text-gray-400 mt-4">
              Your document is processed securely and not stored on our servers.
            </p>
          </div>
        </div>
      </motion.div>
    );
  };
  
  // Enhanced Stepper Component
  const StepperComponent = ({ currentStep, stepsCompleted }) => {
    const steps = [
      { title: 'Upload', icon: <FileType2 className="h-4 w-4" /> },
      { title: 'Extract', icon: <CheckCircle2 className="h-4 w-4" /> }
    ];
    
    return (
      <div className="mb-8 px-4 sm:px-0" aria-label="Progress steps" role="navigation">
        <div className="w-full flex justify-between items-center relative">
          {/* Progress Bar */}
          <div className="absolute h-1 top-1/3 transform -translate-y-1/2 left-0 right-0 bg-gray-200 z-0">
            <motion.div 
              className="h-1 bg-gradient-to-r from-green-400 to-green-600"
              initial={{ width: "0%" }}
              animate={{ width: `${currentStep === 0 ? 0 : 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Steps */}
          {steps.map((step, idx) => (
            <div key={idx} className="z-10 flex flex-col items-center">
              <motion.div 
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                  idx < currentStep 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : idx === currentStep 
                      ? 'bg-white border-green-600 text-green-600' 
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                aria-current={idx === currentStep ? "step" : undefined}
                aria-label={`Step ${idx + 1}: ${step.title} ${idx < currentStep ? 'completed' : idx === currentStep ? 'current' : 'upcoming'}`}
              >
                {idx < currentStep ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </motion.div>
                ) : (
                  <div className="h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                    {step.icon}
                  </div>
                )}
              </motion.div>
              <span 
                className={`mt-2 text-xs sm:text-sm font-medium ${
                  idx <= currentStep 
                    ? 'text-green-600' 
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Step 2: Preview & Confirm
  const renderPreviewStep = () => {
    if (!file || !previewUrl) return null

    // Show passport data if it has been processed
    if (processedData && !isProcessing) {
      return (
        <motion.div 
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Document Preview */}
            <motion.div 
              className="md:w-1/3 flex-shrink-0"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="bg-white rounded-lg overflow-hidden border shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-green-100 rounded-md mr-2">
                      <FileType2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">{file.name}</h3>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  {file.type === 'application/pdf' ? (
                    <div className="flex items-center justify-center bg-gray-50 p-4 min-h-[300px]">
                      <iframe 
                        src={previewUrl} 
                        className="w-full h-[400px] border rounded"
                        title="PDF Preview"
                        aria-label="PDF document preview"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center p-4 bg-gray-50">
                      <motion.img 
                        src={previewUrl} 
                        alt="Passport preview" 
                        className="max-h-[600px] object-contain" 
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Right column - Extracted Data */}
            <motion.div 
              className="md:w-2/3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PassportDataDisplay 
                data={processedData} 
                onReset={resetAll}
              />
            </motion.div>
          </div>
        </motion.div>
      )
    }
    
    // Default preview step content when data is not yet processed
    const isPdf = file.type === 'application/pdf'
    
    return (
      <motion.div 
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-1.5 bg-green-100 rounded-md mr-2">
                <FileType2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-900">{file.name}</h3>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-transparent hover:bg-gray-100 text-gray-500"
              onClick={resetAll}
              aria-label="Cancel and return to upload"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
          
          <div className="p-4 flex justify-center items-center bg-gray-50">
            {isPdf ? (
              <div className="w-full flex flex-col items-center">
                <iframe 
                  src={previewUrl} 
                  className="w-full h-[400px] border rounded"
                  title="PDF Preview"
                  aria-label="PDF document preview"
                />
              </div>
            ) : (
              <motion.img 
                src={previewUrl} 
                alt="Document preview" 
                className="max-h-[400px] object-contain" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 gap-1 border bg-white text-gray-900 hover:bg-gray-100"
            onClick={resetAll}
            aria-label="Cancel and return to upload"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: "#059669" }}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 gap-1 bg-green-600 text-white`}
            onClick={processPassport}
            disabled={isProcessing}
            aria-label="Process document and extract data"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Extract Data</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </>
            )}
          </motion.button>
        </div>
        
        {/* Processing indicator with motion */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <div className="bg-green-50 rounded-lg border border-green-100 p-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-green-100 rounded-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-5 w-5 text-green-600" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-medium text-green-800">Processing your document</h3>
                  <p className="text-sm text-green-700 mt-1">
                    We're analyzing your passport document with our OCR system.
                    This should only take a few seconds...
                  </p>
                  {/* Progress indicator */}
                  <div className="mt-3 bg-green-200 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Error message with motion */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <div className="bg-red-50 rounded-lg border border-red-100 p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-red-100 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800">Processing Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                      onClick={() => setError(null)}
                      aria-label="Dismiss error message"
                    >
                      <X className="h-3 w-3" />
                      <span>Dismiss</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Enhanced Stepper */}
      <StepperComponent 
        currentStep={currentStep} 
        stepsCompleted={processedData ? 2 : currentStep} 
      />
      
      {/* Main Content with AnimatePresence for smooth transitions between steps */}
      <AnimatePresence mode="wait">
        <div className="mb-10">
          {renderStep()}
        </div>
      </AnimatePresence>
    </div>
  )
}