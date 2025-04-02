'use client'

import React, { useState } from 'react'
import PassportUploader from '@/components/PassportUploader'
import { motion } from 'framer-motion'

export default function Home() {
  const [passportData, setPassportData] = useState(null)

  const handleDataExtracted = (data) => {
    if (!data) return
    setPassportData(data)
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6"
      >
        <PassportUploader onDataExtracted={handleDataExtracted} />
      </motion.div>
    </div>
  )
}
