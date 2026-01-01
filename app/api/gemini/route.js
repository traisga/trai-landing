// app/api/gemini/route.js
// Next.js App Router - Gemini API Proxy
// API key is stored in Vercel Environment Variables (GEMINI_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json();
    const { model, contents, generationConfig, safetySettings } = body;

    if (!model || !contents) {
      return Response.json({ error: 'Model ve contents gerekli' }, { status: 400 });
    }

    // Build request body
    const requestBody = { contents };
    if (generationConfig) requestBody.generationConfig = generationConfig;
    if (safetySettings) requestBody.safetySettings = safetySettings;

    // Call Gemini API with key from environment
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return Response.json(
        { error: data.error?.message || 'API hatası' },
        { status: response.status }
      );
    }

    return Response.json(data);

  } catch (error) {
    console.error('Server Error:', error);
    return Response.json(
      { error: 'Sunucu hatası: ' + error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}