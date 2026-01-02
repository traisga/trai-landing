// app/api/gemini/route.js
export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { model, contents, generationConfig, safetySettings } = body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({ contents, generationConfig, safetySettings })
      }
    );

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}