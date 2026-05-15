import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, isPlaying, onStateChange }) {
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);

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
        height: '10',
        width: '10',
        videoId,
        playerVars: { 
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1
        },
        events: { 
          onReady: () => {
            isReadyRef.current = true;
            if (videoId) {
              playerRef.current.loadVideoById(videoId);
            }
          },
          onStateChange 
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

  // Using absolute positioning off-screen instead of display: none to ensure YT API initializes properly
  return (
    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '10px', height: '10px', overflow: 'hidden', pointerEvents: 'none' }}>
      <div id="yt-player" />
    </div>
  );
}
