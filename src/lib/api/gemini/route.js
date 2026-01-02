// app/api/gemini/route.js
// Next.js App Router API Route - Gemini API proxy
// API key Vercel Environment Variables'dan alınır

// Route segment config (App Router style)
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment variables');
    return Response.json(
      { error: 'API key not configured. Add GEMINI_API_KEY to Vercel Environment Variables.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { model, contents, generationConfig, safetySettings } = body;
    
    if (!model) {
      return Response.json({ error: 'Model is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents,
          generationConfig,
          safetySettings
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return Response.json(data, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Gemini API error:', error);
    return Response.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}