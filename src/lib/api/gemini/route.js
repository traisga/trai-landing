// This API route proxies requests to Google's Gemini API
// The API key is stored securely in Vercel Environment Variables
// and never exposed to the client

export async function POST(request) {
  try {
    const body = await request.json();
    const { model, contents, generationConfig, safetySettings } = body;
    
    const apiKey = process.env.GOOGLE_API_KEY; // NOT NEXT_PUBLIC_ - server only!
    
    if (!apiKey) {
      return Response.json(
        { error: { message: 'API key not configured on server' } },
        { status: 500 }
      );
    }
    
    if (!model) {
      return Response.json(
        { error: { message: 'Model not specified' } },
        { status: 400 }
      );
    }
    
    // Build request body - only include fields that are provided
    const requestBody = { contents };
    if (generationConfig) requestBody.generationConfig = generationConfig;
    if (safetySettings) requestBody.safetySettings = safetySettings;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    const data = await response.json();
    
    // Pass through the response status
    return Response.json(data, { status: response.status });
    
  } catch (error) {
    console.error('API Proxy Error:', error);
    return Response.json(
      { error: { message: error.message || 'Internal server error' } },
      { status: 500 }
    );
  }
}
