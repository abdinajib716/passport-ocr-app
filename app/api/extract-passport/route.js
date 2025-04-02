import { NextResponse } from 'next/server'

// This route will forward requests to our actual OCR endpoint at /api/ocr
export async function POST(request) {
  try {
    console.log('🔄 Forwarding request to /api/ocr endpoint...')
    
    // Clone the request body
    const clonedBody = await request.blob();
    
    // Forward to the actual OCR endpoint
    const response = await fetch(new URL('/api/ocr', request.url), {
      method: 'POST',
      body: clonedBody,
      headers: {
        // Forward necessary headers
        'Content-Type': request.headers.get('Content-Type')
      }
    });
    
    // Return the response from the OCR endpoint
    const data = await response.json();
    return NextResponse.json(data, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('❌ Error in forwarding to OCR endpoint:', error.message);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
