// pages/api/gemini.js
// Bu dosya Gemini API çağrılarını güvenli şekilde yapar
// API key Vercel Environment Variables'dan alınır

export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment variables');
    return res.status(500).json({ error: 'API key not configured. Add GEMINI_API_KEY to Vercel Environment Variables.' });
  }

  try {
    const { model, contents, generationConfig, safetySettings } = req.body;
    
    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
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
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb' // Resim gönderimi için boyut limiti
    },
    responseLimit: false
  }
};