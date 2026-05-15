const KEY = import.meta.env.VITE_YT_API_KEY;

export async function searchYouTube(query) {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query + ' audio')}&key=${KEY}`
    );
    const data = await res.json();
    
    if (!data.items) {
      console.warn("No items returned from YouTube API. Check your API key and quota.", data);
      return [];
    }

    return data.items.map(item => ({
      videoId: item.id.videoId,
      // YouTube returns HTML entities in titles like &#39;
      title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));
  } catch (error) {
    console.error("YouTube search error:", error);
    return [];
  }
}
