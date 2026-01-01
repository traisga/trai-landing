// API and Firebase configuration
// These values come from Vercel Environment Variables

export const CONFIG = {
  name: 'TrAi',
  slogan: 'Sanal Stil Asistanın',
  
  // Google API - from Vercel env
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
  
  // Models
  textModel: 'gemini-2.0-flash',
  freemiumImageModel: 'gemini-2.5-flash-image',
  imageModel: 'gemini-3-pro-image-preview',
  videoModel: 'veo-3.0-fast-generate-001',
  
  // Timeouts
  timeoutMs: 90000,
  videoTimeoutMs: 120000,
  
  // Firebase config - from Vercel env
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
  }
};

// Logo as base64
export const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiByeD0iMjgiIGZpbGw9IiMyOTYyRkYiLz4KPHRleHQgeD0iNTAlIiB5PSI1NSUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iSW50ZXIsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSI5MDAiPlRyQWk8L3RleHQ+Cjwvc3ZnPg==';
