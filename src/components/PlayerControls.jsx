import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Mic2, ListMusic, MonitorSpeaker } from 'lucide-react';

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  progress = 0,
  onSeek,
  currentSong,
  onNext,
  onPrevious
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818]/95 backdrop-blur-2xl border-t border-white/5 px-4 flex items-center justify-between text-white z-50">
      
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
        {currentSong ? (
          <>
            <img 
              src={currentSong.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&h=150&fit=crop"} 
              alt="Cover" 
              className="w-14 h-14 rounded-md shadow-lg object-cover"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm hover:underline cursor-pointer line-clamp-1">
                {currentSong.title || "Unknown Title"}
              </span>
              <span className="text-xs text-gray-400 hover:underline cursor-pointer line-clamp-1 mt-1">
                {currentSong.artist || "Unknown Artist"}
              </span>
            </div>
            <button className="ml-2 text-gray-400 hover:text-white transition-colors">
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2Zm3.158.252A3.3 3.3 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.04.061a.75.75 0 0 1-1.284-.081l-.086-.084a3.083 3.083 0 0 0-2.772-.806Z"></path></svg>
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-500 font-medium">No track selected</div>
        )}
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex flex-col items-center justify-center max-w-[40%] w-full gap-2">
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors" title="Shuffle">
            <Shuffle size={20} />
          </button>
          <button onClick={onPrevious} className="text-gray-400 hover:text-white transition-colors" title="Previous">
            <SkipBack size={24} fill="currentColor" />
          </button>
          
          <button 
            onClick={onPlayPause}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>

          <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors" title="Next">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors" title="Repeat">
            <Repeat size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 text-[11px] text-gray-400 font-medium tracking-wide">
          <span className="w-8 text-right">0:00</span>
          <div 
            className="h-1.5 flex-1 bg-white/20 rounded-full cursor-pointer relative group flex items-center"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              onSeek?.(p);
            }}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors"
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow transition-opacity"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            ></div>
          </div>
          <span className="w-8">3:45</span>
        </div>
      </div>

      {/* Right: Extra Controls */}
      <div className="flex items-center justify-end gap-4 w-1/3 min-w-[200px] text-gray-400">
        <button className="hover:text-white transition-colors hidden lg:block" title="Lyrics"><Mic2 size={18} /></button>
        <button className="hover:text-white transition-colors hidden lg:block" title="Queue"><ListMusic size={18} /></button>
        <button className="hover:text-white transition-colors hidden sm:block" title="Connect to a device"><MonitorSpeaker size={18} /></button>
        
        <div className="flex items-center gap-2 group w-24">
          <button className="hover:text-white transition-colors"><Volume2 size={20} /></button>
          <div className="h-1.5 flex-1 bg-white/20 rounded-full cursor-pointer relative flex items-center">
            <div className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1db954] rounded-full w-2/3 transition-colors"></div>
            <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow transform -translate-x-1/2 transition-opacity"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
