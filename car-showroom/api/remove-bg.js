// api/remove-bg.js
// Place this file in an 'api' folder in your project root

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if API key is configured
    if (!process.env.REMOVE_BG_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured. Please add REMOVE_BG_API_KEY to environment variables in Vercel settings.' 
      });
    }

    const { image_base64 } = req.body;

    if (!image_base64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Call Remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.REMOVE_BG_API_KEY
      },
      body: JSON.stringify({
        image_file_b64: image_base64,
        size: 'auto',
        type: 'car'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: errorData.errors?.[0]?.title || 'Failed to remove background' 
      });
    }

    // Get the image as buffer
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Return base64 image
    return res.status(200).json({ 
      image_base64: base64Image 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}