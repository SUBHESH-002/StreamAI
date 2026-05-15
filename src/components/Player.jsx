import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, onStateChange }) {
  const playerRef = useRef(null);

  useEffect(() => {
    // Only load the script once
    if (!document.getElementById('yt-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    // Attach the callback to window. This will fire when the API is loaded.
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId,
        playerVars: { autoplay: 1 },
        events: { onStateChange },
      });
    };

    // If the API is already loaded but component remounts, initialize player manually
    if (window.YT && window.YT.Player && !playerRef.current) {
        window.onYouTubeIframeAPIReady();
    }
  }, []);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function' && videoId) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // Hidden div — we only want the audio
  return <div id="yt-player" style={{ display: 'none' }} />;
}
