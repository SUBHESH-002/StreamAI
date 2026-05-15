import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchYouTube } from '../api/youtube';

export default function SearchBar({ onResults }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Debounce the search input by 400ms
    const timeoutId = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const results = await searchYouTube(query);
          onResults(results);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        onResults([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, onResults]);

  return (
    <div className="relative w-full max-w-md group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-white transition-colors">
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3 bg-[#242424] border border-transparent rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-[#2a2a2a] focus:border-white/20 focus:ring-0 transition-all shadow-inner"
        placeholder="What do you want to listen to?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
