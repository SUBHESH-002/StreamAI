export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { likedGenres = [], favArtists = [], recentTracks = [], currentTrack, userPrompt } = req.body;

  const prompt = `
    You are a music recommendation AI. Suggest 8 songs for this user.
    ${userPrompt ? `User's specific request: "${userPrompt}"` : ''}
    
    Their liked genres: ${likedGenres.join(', ')}
    Their favourite artists: ${favArtists.join(', ')}
    Recently played: ${recentTracks.map(t => t.title).join(', ')}
    Currently playing: ${currentTrack?.title || 'nothing'}
    
    Return ONLY a valid JSON array, no other text:
    [{"title": "Song Name", "artist": "Artist Name", "searchQuery": "Song Name Artist Name audio"}]
  `;

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY; // Fallback in case the name isn't changed
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.candidates[0].content.parts[0].text;
    const tracks = JSON.parse(text);
    res.json({ tracks });
  } catch (error) {
    console.error('Failed to generate queue:', error);
    res.status(500).json({ error: 'Failed to generate queue' });
  }
}
