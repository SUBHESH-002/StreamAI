import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { addToHistory } from './api/playlists';

import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AIPanel from './components/AIPanel';
import PlayerControls from './components/PlayerControls';
import YouTubePlayer from './components/Player';

function App() {
  const [user, setUser] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [playbackTime, setPlaybackTime] = useState({ current: 0, duration: 0, percent: 0 });

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch(error => console.error("Anonymous auth failed:", error));
      }
    });
    return () => unsubscribe();
  }, []);

  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < queue.length 
    ? queue[currentTrackIndex] 
    : null;

  const handlePlayPause = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrackIndex < queue.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handlePlayTrack = (track) => {
    const newQueue = [...queue, track];
    setQueue(newQueue);
    setCurrentTrackIndex(newQueue.length - 1);
    setIsPlaying(true);
    setSearchResults([]); 
    
    if (user) {
      addToHistory(user.uid, track).catch(console.error);
    }
  };

  const handleAddToQueue = (tracks) => {
    setQueue(prev => [...prev, ...tracks]);
    if (currentTrackIndex === -1 && tracks.length > 0) {
      setCurrentTrackIndex(queue.length);
      setIsPlaying(true);
      if (user) {
        addToHistory(user.uid, tracks[0]).catch(console.error);
      }
    }
  };

  // Reset playback time when track changes
  useEffect(() => {
    setPlaybackTime({ current: 0, duration: 0, percent: 0 });
  }, [currentTrackIndex]);

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans pb-32">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#080808]/80 backdrop-blur-xl z-40 flex items-center justify-between px-8 border-b border-white/5">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1db954] to-emerald-400 tracking-tight">
          StreamAI
        </h1>
        <div className="flex-1 max-w-2xl mx-8">
          <SearchBar onResults={setSearchResults} />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shadow-lg border border-white/5 cursor-pointer hover:bg-white/20 transition-colors">
          {user ? 'U' : '?'}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="pt-28 px-8 max-w-[1600px] mx-auto flex flex-col xl:flex-row gap-8">
        
        {/* Left/Main Column - Search Results & Queue */}
        <div className="flex-1 flex flex-col gap-8">
          {searchResults.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SearchResults results={searchResults} onPlay={handlePlayTrack} />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#181818] to-[#121212] rounded-3xl p-12 border border-white/5 flex flex-col items-center justify-center text-center min-h-[40vh] shadow-xl">
              <div className="w-20 h-20 bg-[#1db954]/10 rounded-full flex items-center justify-center mb-6 border border-[#1db954]/20">
                <svg className="w-10 h-10 text-[#1db954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Listen to your vibe</h2>
              <p className="text-gray-400 max-w-md text-lg">
                Search for any song, artist, or album. Or use the AI Panel to let Claude craft the perfect playlist for you.
              </p>
            </div>
          )}

          {/* Current Queue Display */}
          {queue.length > 0 && searchResults.length === 0 && (
            <div className="bg-[#181818]/50 rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 tracking-tight">Up Next</h3>
              <div className="space-y-2">
                {queue.map((track, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setCurrentTrackIndex(i);
                      setIsPlaying(true);
                      if (user) addToHistory(user.uid, track).catch(console.error);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${i === currentTrackIndex ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-8 text-center text-sm font-medium text-gray-500">
                      {i === currentTrackIndex && isPlaying ? (
                        <div className="flex gap-[3px] items-end justify-center h-4">
                          <div className="w-[3px] bg-[#1db954] h-2 animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-[3px] bg-[#1db954] h-4 animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-[3px] bg-[#1db954] h-3 animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <img src={track.thumbnail} alt={track.title} className="w-12 h-12 rounded-md object-cover shadow-md" />
                    <div className="flex flex-col flex-1 overflow-hidden whitespace-nowrap">
                      <span className={`font-semibold truncate ${i === currentTrackIndex ? 'text-[#1db954]' : 'text-white'}`} dangerouslySetInnerHTML={{ __html: track.title }}></span>
                      <span className="text-sm text-gray-400 font-medium truncate">{track.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - AI Panel */}
        <aside className="w-full xl:w-[420px] shrink-0">
          <div className="sticky top-28">
            <AIPanel 
              uid={user?.uid} 
              currentTrack={currentTrack} 
              onAddToQueue={handleAddToQueue} 
            />
          </div>
        </aside>
      </main>

      {/* Hidden YouTube Player */}
      <YouTubePlayer 
        videoId={currentTrack?.videoId} 
        isPlaying={isPlaying}
        onProgress={setPlaybackTime}
        onError={(code) => {
          // If embedding is blocked (101 or 150), skip to next song automatically
          if (code === 101 || code === 150) {
            handleNext();
          }
        }}
        onStateChange={(e) => {
          // YT.PlayerState.ENDED = 0, PLAYING = 1, PAUSED = 2
          if (e.data === 0) {
            handleNext();
          } else if (e.data === 1) {
            setIsPlaying(true);
          } else if (e.data === 2) {
            setIsPlaying(false);
          }
        }} 
      />

      {/* Fixed Bottom Player Controls */}
      <PlayerControls 
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        progress={playbackTime}
        currentSong={currentTrack}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={(p) => setPlaybackTime(prev => ({...prev, percent: p}))}
      />
    </div>
  );
}

export default App;
