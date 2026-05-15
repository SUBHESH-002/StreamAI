import { Play } from 'lucide-react';

export default function SearchResults({ results, onPlay }) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6 bg-[#121212] p-4 rounded-xl shadow-lg border border-white/5">
      <h2 className="text-xl font-bold text-white mb-4 px-2">Top Results</h2>
      <div className="flex flex-col gap-1">
        {results.map((result) => (
          <div 
            key={result.videoId}
            onClick={() => onPlay(result)}
            className="group flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <div className="relative w-14 h-14 flex-shrink-0">
              <img 
                src={result.thumbnail} 
                alt={result.title} 
                className="w-full h-full object-cover rounded-md shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-md backdrop-blur-[1px] transition-all">
                <Play size={24} fill="currentColor" className="text-white" />
              </div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden justify-center">
              <span className="text-white font-medium text-base line-clamp-1 group-hover:text-[#1db954] transition-colors">
                {result.title}
              </span>
              <span className="text-gray-400 text-sm line-clamp-1 mt-0.5">
                {result.artist}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
