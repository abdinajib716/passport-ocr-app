import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    console.log('🔄 Starting document processing...')
    
    // Check API key
    if (!process.env.MINDEE_API_KEY) {
      console.error('❌ Missing API key: MINDEE_API_KEY environment variable is not set')
      return NextResponse.json(
        { 
          error: 'API key not configured. Please set the MINDEE_API_KEY environment variable.'
        },
        { status: 500 }
      )
    }
    console.log('✅ Configuration validated')

    // Get and validate file
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('❌ Form data error:', error)
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      )
    }

    const file = formData.get('file')
    if (!file) {
      console.error('❌ No file provided')
      return NextResponse.json(
        { error: 'Please select a file to process' },
        { status: 400 }
      )
    }

    // Log file info
    console.log(`📁 File received: ${file.name} Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
    console.log(`✅ File type: ${file.type}`)

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      console.error(`❌ Invalid file type: ${file.type}`)
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPG, PNG, or PDF file.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    let buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('❌ File conversion error:', error)
      return NextResponse.json(
        { error: 'Failed to process the file. Please try again.' },
        { status: 500 }
      )
    }

    // Create form data for Karshe OCR API
    const mindeeFormData = new FormData()
    const blob = new Blob([buffer], { type: file.type })
    mindeeFormData.append('document', blob, file.name)

    // Call API
    console.log('🔄 Calling Karshe OCR API...')
    let response
    try {
      response = await fetch(
        'https://api.mindee.net/v1/products/mindee/passport/v1/predict',
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.MINDEE_API_KEY}`,
          },
          body: mindeeFormData
        }
      )
    } catch (error) {
      console.error('❌ Karshe OCR API network error:', error)
      return NextResponse.json(
        { error: 'Failed to connect to OCR service. Please try again.' },
        { status: 503 }
      )
    }

    // Check response status
    if (!response.ok) {
      console.error(`❌ Karshe OCR API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `OCR service returned error: ${response.status}` },
        { status: response.status }
      )
    }

    // Parse response
    let result
    try {
      result = await response.json()
      console.log('✅ OCR API response received')
    } catch (error) {
      console.error('❌ Response parsing error:', error)
      return NextResponse.json(
        { error: 'Failed to parse results from OCR service' },
        { status: 500 }
      )
    }

    // Safety check for required data
    if (!result?.document?.inference?.prediction) {
      console.error('❌ Invalid API response structure')
      return NextResponse.json(
        { error: 'Invalid response from OCR service' },
        { status: 500 }
      )
    }

    // Extract the prediction and format the response
    const prediction = result.document.inference.prediction
    const document = result.document
    
    // Check if the image actually contains a passport
    const hasMinimumPassportFields = prediction.surname?.value && 
      (prediction.id_number?.value || prediction.given_names?.length > 0);
    
    // Check confidence levels of key fields
    const hasReasonableConfidence = 
      (prediction.surname?.confidence > 0.3) || 
      (prediction.id_number?.confidence > 0.3);
    
    // If it doesn't look like a passport, return an error
    if (!hasMinimumPassportFields || !hasReasonableConfidence) {
      console.error('❌ No valid passport detected in the image')
      return NextResponse.json(
        { error: 'No valid passport detected in the uploaded image. Please upload a clear image of a passport.' },
        { status: 400 }
      )
    }
    
    // Debug prediction data for PDF issues
    console.log('Gender field raw data:', prediction.gender);
    console.log('Birth date field raw data:', prediction.birth_date);

    // Basic response structure
    const formattedResponse = {
      prediction: {
        // Handle all fields in a consistent manner
        country: {
          value: prediction.country?.value || null,
          confidence: prediction.country?.confidence || 0
        },
        given_names: prediction.given_names || [],
        surname: {
          value: prediction.surname?.value || null,
          confidence: prediction.surname?.confidence || 0
        },
        id_number: {
          value: prediction.id_number?.value || null,
          confidence: prediction.id_number?.confidence || 0
        },
        birth_date: {
          value: prediction.birth_date?.value || null,
          confidence: prediction.birth_date?.confidence || 0
        },
        birth_place: {
          value: prediction.birth_place?.value || null,
          confidence: prediction.birth_place?.confidence || 0
        },
        gender: {
          // Ensure gender is correctly mapped and not overridden by birth_date
          // If gender value matches a date pattern, it's likely incorrect
          value: (prediction.gender?.value && !isDatePattern(prediction.gender.value)) 
            ? prediction.gender.value 
            : (prediction.gender?.value === 'M' || prediction.gender?.value === 'F' || prediction.gender?.value === 'X')
              ? prediction.gender.value
              : 'N/A',
          confidence: prediction.gender?.confidence || 0
        },
        issuance_date: {
          value: prediction.issuance_date?.value || null,
          confidence: prediction.issuance_date?.confidence || 0
        },
        expiry_date: {
          value: prediction.expiry_date?.value || null,
          confidence: prediction.expiry_date?.confidence || 0
        },
        mrz1: {
          value: prediction.mrz1?.value || null,
          confidence: prediction.mrz1?.confidence || 0
        },
        mrz2: {
          value: prediction.mrz2?.value || null,
          confidence: prediction.mrz2?.confidence || 0
        }
      },
      processing_time: document.inference.processing_time || 0,
      status: "success"
    }

    console.log('✅ Document processed successfully')
    return NextResponse.json(formattedResponse)

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the document' },
      { status: 500 }
    )
  }
}

// Helper function to check if a string matches a date pattern
function isDatePattern(str) {
  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  return dateRegex.test(str);
}