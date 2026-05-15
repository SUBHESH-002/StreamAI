import { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';

export default function YouTubePlayer({ videoId, isPlaying, onStateChange, onProgress, onError }) {
  const durationRef = useRef(0);
  
  // We need to keep refs to our callbacks so they don't cause infinite re-renders or stale closures inside ReactPlayer
  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  if (!videoId) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -100, opacity: 0.01, pointerEvents: 'none' }}>
      <ReactPlayer 
        url={`https://www.youtube.com/watch?v=${videoId}`}
        playing={isPlaying}
        width="100%"
        height="100%"
        controls={false}
        playsinline={true}
        onDuration={(duration) => {
          durationRef.current = duration;
        }}
        onProgress={({ playedSeconds }) => {
          if (onProgressRef.current && durationRef.current > 0) {
            onProgressRef.current({
              current: playedSeconds,
              duration: durationRef.current,
              percent: (playedSeconds / durationRef.current) * 100
            });
          }
        }}
        onEnded={() => onStateChange({ data: 0 })}
        onPlay={() => onStateChange({ data: 1 })}
        onPause={() => onStateChange({ data: 2 })}
        onError={(e) => {
           console.error("ReactPlayer Error:", e);
           // Simulate the code 150 (embedding restricted) so App.jsx auto-skips
           if (onError) onError(150);
        }}
        config={{
          youtube: {
            playerVars: { 
              origin: window.location.origin,
              // Use nocookie to bypass browser adblockers and strict tracking prevention
              host: 'https://www.youtube-nocookie.com'
            }
          }
        }}
      />
    </div>
  );
}
