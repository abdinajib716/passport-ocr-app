'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileType2, CheckCircle2, Github } from 'lucide-react'

export default function AnimatedLayout({ children }) {
  const currentYear = new Date().getFullYear();
  
  // Logo animation variants
  const logoVariants = {
    initial: { scale: 0.9, rotate: -10 },
    animate: { 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { 
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };
  
  // Header variants for mobile animation
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      {/* Modern Header with Wallalaha ICT branding */}
      <motion.header 
        className="bg-gradient-to-r from-green-600 to-green-700 shadow-md w-full"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <motion.div 
              className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto justify-center sm:justify-start"
              variants={itemVariants}
            >
              <motion.div 
                className="bg-white p-2 rounded-full shadow-md mr-3 flex-shrink-0"
                variants={logoVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <FileType2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </motion.div>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl font-bold text-white">Passport OCR</h1>
                <p className="text-green-100 text-xs sm:text-sm">
                  Extract passport data with advanced OCR technology
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center"
              variants={itemVariants}
            >
              <motion.a 
                href="https://github.com/abdinajib716" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                aria-label="View project on GitHub"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm">View on GitHub</span>
                <Github className="h-5 w-5" />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Modern Footer with Wallalaha ICT branding */}
      <motion.footer 
        className="mt-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
            <div className="flex items-center mb-4 sm:mb-0">
              <motion.div 
                className="p-1.5 bg-green-100 rounded-full mr-2 flex-shrink-0"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </motion.div>
              <p className="text-gray-700 text-sm whitespace-nowrap">
                Built with 💚 by <span className="font-semibold text-green-700">@wallalaha ict</span>
              </p>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <p>© {currentYear} Wallalaha ICT. All rights reserved.</p>
            </div>
          </div>
        </div>
        <motion.div 
          className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        ></motion.div>
      </motion.footer>
    </>
  )
}
