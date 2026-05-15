import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, isPlaying, onStateChange, onProgress, onError }) {
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);
  const onStateChangeRef = useRef(onStateChange);
  const onProgressRef = useRef(onProgress);
  const onErrorRef = useRef(onError);

  // Keep callback refs up to date to prevent stale closures
  useEffect(() => { onStateChangeRef.current = onStateChange; }, [onStateChange]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    // Only load the script once
    if (!document.getElementById('yt-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '100%', 
        width: '100%',
        videoId,
        playerVars: { 
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1, // CRITICAL for mobile/PWA playback
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: { 
          onReady: () => {
            isReadyRef.current = true;
            if (videoId) {
              playerRef.current.loadVideoById(videoId);
            }
          },
          onStateChange: (e) => {
            if (onStateChangeRef.current) onStateChangeRef.current(e);
          },
          onError: (e) => {
            console.error("YouTube Player Error:", e.data);
            if (onErrorRef.current) onErrorRef.current(e.data);
          }
        },
      });
    };

    if (window.YT && window.YT.Player && !playerRef.current) {
        window.onYouTubeIframeAPIReady();
    }
  }, []);

  useEffect(() => {
    if (isReadyRef.current && playerRef.current && typeof playerRef.current.loadVideoById === 'function' && videoId) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  useEffect(() => {
    if (isReadyRef.current && playerRef.current && typeof playerRef.current.playVideo === 'function') {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // Progress Tracker
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (isReadyRef.current && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || 0;
          if (duration > 0 && onProgressRef.current) {
            onProgressRef.current({
              current: currentTime,
              duration: duration,
              percent: (currentTime / duration) * 100
            });
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    // Fixed full screen behind app to prevent any browser throttling of invisible elements
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -100, opacity: 0.01, pointerEvents: 'none' }}>
      <div id="yt-player" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
