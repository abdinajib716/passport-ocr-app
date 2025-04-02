import Jimp from 'jimp'

export async function validateAndProcessFile(file) {
  if (!file) {
    throw new Error('No file provided')
  }

  // Get file buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Check file type
  const fileType = file.type
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(fileType)) {
    throw new Error('Invalid file type. Only JPG, PNG, and PDF files are supported.')
  }

  // Check file size (5MB limit)
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  let processedBuffer = buffer
  let isPdf = false

  if (fileType === 'application/pdf') {
    isPdf = true
    throw new Error('PDF processing not implemented yet')
  } else {
    try {
      // Process image with Jimp
      const image = await Jimp.read(buffer)
      
      // Resize to optimal size for OCR (around 1500px width)
      const maxWidth = 1500
      if (image.bitmap.width > maxWidth) {
        const ratio = maxWidth / image.bitmap.width
        image.scale(ratio)
      }

      // Convert to grayscale first
      image.grayscale()
      
      // Increase contrast
      image.contrast(0.2)
      
      // Adjust brightness
      image.brightness(0.1)
      
      // Sharpen the image
      image.sharpen()

      // Optimize quality for OCR
      image.quality(90)
      
      // Get processed buffer
      processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
    } catch (error) {
      console.error('Image processing error:', error)
      throw new Error('Failed to process image file')
    }
  }

  return {
    buffer: processedBuffer,
    isPdf,
    fileType
  }
}

export function extractMRZData(text) {
  if (!text) return null

  // Clean the text
  const cleanText = text.replace(/\s+/g, '')

  // Try to find MRZ pattern (more flexible pattern)
  const mrzPattern = /P[A-Z<][A-Z]{3}[A-Z<]{39}[0-9][A-Z0-9<]{42}/
  const match = cleanText.match(mrzPattern)

  if (!match) return null

  try {
    const mrz = match[0]
    
    // Extract data from MRZ
    const data = {
      documentType: mrz.substring(0, 1),
      issuingCountry: mrz.substring(2, 5),
      lastName: mrz.substring(5, 44).split('<')[0],
      firstName: mrz.substring(5, 44).split('<').slice(1).join(' ').trim(),
      passportNumber: mrz.substring(44, 53),
      nationality: mrz.substring(54, 57),
      dateOfBirth: formatDate(mrz.substring(57, 63)),
      gender: mrz.substring(63, 64),
      expiryDate: formatDate(mrz.substring(64, 70))
    }

    return data
  } catch (error) {
    console.error('MRZ extraction error:', error)
    return null
  }
}

export function extractPassportData(text) {
  if (!text) return null

  try {
    // More flexible regex patterns
    const data = {
      firstName: extractField(text, /(?:Given|First)\s*Names?:?\s*([A-Za-z\s\-]+)/i),
      lastName: extractField(text, /(?:Surname|Last\s*Name):?\s*([A-Za-z\s\-]+)/i),
      passportNumber: extractField(text, /(?:Passport|Document)\s*(?:No|Number|#):?\s*([A-Z0-9]+)/i),
      dateOfBirth: extractField(text, /(?:Date\s*of\s*Birth|Birth\s*Date|DOB):?\s*(\d{1,2}[-./]\d{1,2}[-./]\d{2,4})/i),
      expiryDate: extractField(text, /(?:Date\s*of\s*Expiry|Expiry\s*Date):?\s*(\d{1,2}[-./]\d{1,2}[-./]\d{2,4})/i),
      nationality: extractField(text, /Nationality:?\s*([A-Za-z\s]+)/i),
      gender: extractField(text, /(?:Sex|Gender):?\s*([MF])/i)
    }

    // Only return if we found at least some data
    const hasData = Object.values(data).some(value => value !== null && value !== '')
    return hasData ? data : null
  } catch (error) {
    console.error('Data extraction error:', error)
    return null
  }
}

function extractField(text, pattern) {
  const match = text.match(pattern)
  return match ? match[1].trim() : null
}

function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 6) return null
  const year = dateStr.substring(0, 2)
  const month = dateStr.substring(2, 4)
  const day = dateStr.substring(4, 6)
  const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`
  return `${day}/${month}/${fullYear}`
}
