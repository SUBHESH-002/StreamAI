import { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { searchYouTube } from '../api/youtube';
import { Wand2, Loader2, Music, Sparkles } from 'lucide-react';

export default function AIPanel({ uid, currentTrack, onAddToQueue }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!uid) {
      setError('Please log in to generate an AI queue.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setSuggestions([]);

    try {
      // 1. Fetch user's taste profile from Firestore
      const userRef = doc(db, `users/${uid}`);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      
      const likedGenres = userData.likedGenres || ['pop', 'lofi', 'electronic']; // fallback
      const favArtists = userData.favArtists || [];

      // 2. Fetch last 20 played tracks from History
      const historyRef = collection(db, `users/${uid}/history`);
      const q = query(historyRef, orderBy('playedAt', 'desc'), limit(20));
      const historySnap = await getDocs(q);
      const recentTracks = historySnap.docs.map(doc => doc.data());

      // 3. POST to our backend function
      const res = await fetch('/api/generate-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likedGenres,
          favArtists,
          recentTracks,
          currentTrack,
          userPrompt: prompt
        })
      });

      if (!res.ok) throw new Error('Failed to reach AI queue generator');
      
      const data = await res.json();
      
      // 4. For each suggestion, fetch the actual YouTube videoId
      const enrichedTracks = [];
      
      // We use a for...of loop to fetch sequentially to avoid overwhelming the YouTube API 
      for (const track of data.tracks) {
        const ytResults = await searchYouTube(track.searchQuery);
        if (ytResults && ytResults.length > 0) {
          enrichedTracks.push({
            title: ytResults[0].title, // using the actual YouTube title
            artist: track.artist || ytResults[0].artist,
            videoId: ytResults[0].videoId,
            thumbnail: ytResults[0].thumbnail
          });
        }
      }

      setSuggestions(enrichedTracks);
      
      // 5. Add to queue
      if (onAddToQueue && enrichedTracks.length > 0) {
        onAddToQueue(enrichedTracks);
      }
      
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('An error occurred while generating. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1a1a2e] to-[#121212] rounded-2xl p-6 shadow-2xl border border-indigo-500/20 w-full text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            AI Queue
          </h2>
          <p className="text-xs text-gray-400">Let AI craft your perfect vibe</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to hear... (e.g. 'something energetic for working out' or 'chill lofi beats')"
          className="w-full bg-[#2a2a3a] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none h-24 transition-all"
        />

        {error && <p className="text-red-400 text-xs px-1">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Magic...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Generate Queue
            </>
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Music size={16} /> Added to your queue
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
            {suggestions.map((track, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-md object-cover shadow" />
                <div className="flex-col flex flex-1 overflow-hidden">
                  <span className="text-sm font-medium text-white line-clamp-1 group-hover:text-indigo-300 transition-colors" dangerouslySetInnerHTML={{ __html: track.title }}></span>
                  <span className="text-xs text-gray-400 line-clamp-1">{track.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
