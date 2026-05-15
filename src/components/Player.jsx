import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, isPlaying, onStateChange }) {
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);
  const onStateChangeRef = useRef(onStateChange);

  // Keep callback ref up to date to prevent stale closures
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

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
        height: '300', // Larger dimensions help bypass ad/autoplay-blockers
        width: '300',
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

  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '300px', height: '300px', opacity: 0.01, overflow: 'hidden', pointerEvents: 'none' }}>
      <div id="yt-player" />
    </div>
  );
}
