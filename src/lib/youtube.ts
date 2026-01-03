// YouTube Data API v3 Integration
// ═══════════════════════════════════════════════════════════════════════════

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeVideo {
  id: string
  title: string
  description: string
  channelId: string
  channelTitle: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  publishedAt: string
  liveBroadcastContent: 'live' | 'upcoming' | 'none'
}

interface YouTubeLiveStream {
  id: string
  videoId: string
  title: string
  description: string
  channelId: string
  channelTitle: string
  thumbnail: string
  viewerCount?: number
  startTime: string
}

interface YouTubeSearchResult {
  kind: string
  items: Array<{
    id: { kind: string; videoId?: string; channelId?: string }
    snippet: {
      title: string
      description: string
      channelId: string
      channelTitle: string
      thumbnails: YouTubeVideo['thumbnails']
      publishedAt: string
      liveBroadcastContent: string
    }
  }>
  pageInfo: { totalResults: number; resultsPerPage: number }
  nextPageToken?: string
}

// Search for Rust-related live streams
export async function searchRustLiveStreams(limit = 10): Promise<YouTubeLiveStream[]> {
  if (!isYouTubeConfigured()) return []

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `type=video&` +
      `eventType=live&` +
      `q=rust+game&` +
      `maxResults=${limit}&` +
      `key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) return []

    const data: YouTubeSearchResult = await response.json()
    
    return data.items
      .filter(item => item.id.videoId)
      .map(item => ({
        id: item.id.videoId!,
        videoId: item.id.videoId!,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        startTime: item.snippet.publishedAt,
      }))
  } catch (e) {
    console.error('YouTube search error:', e)
    return []
  }
}

// Search for Rust videos
export async function searchRustVideos(query = 'rust gameplay', limit = 10): Promise<YouTubeVideo[]> {
  if (!isYouTubeConfigured()) return []

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `type=video&` +
      `q=${encodeURIComponent(query)}&` +
      `maxResults=${limit}&` +
      `order=date&` +
      `key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) return []

    const data: YouTubeSearchResult = await response.json()
    
    return data.items
      .filter(item => item.id.videoId)
      .map(item => ({
        id: item.id.videoId!,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
        liveBroadcastContent: item.snippet.liveBroadcastContent as YouTubeVideo['liveBroadcastContent'],
      }))
  } catch (e) {
    console.error('YouTube search error:', e)
    return []
  }
}

// Get video details
export async function getVideoDetails(videoId: string): Promise<{
  id: string
  title: string
  description: string
  viewCount: number
  likeCount: number
  duration: string
  channelTitle: string
} | null> {
  if (!isYouTubeConfigured()) return null

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics,contentDetails&` +
      `id=${videoId}&` +
      `key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) return null

    const data = await response.json()
    const video = data.items?.[0]
    
    if (!video) return null

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      duration: video.contentDetails.duration,
      channelTitle: video.snippet.channelTitle,
    }
  } catch (e) {
    console.error('YouTube video error:', e)
    return null
  }
}

// Get channel info
export async function getChannelInfo(channelId: string): Promise<{
  id: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: number
  videoCount: number
} | null> {
  if (!isYouTubeConfigured()) return null

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?` +
      `part=snippet,statistics&` +
      `id=${channelId}&` +
      `key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) return null

    const data = await response.json()
    const channel = data.items?.[0]
    
    if (!channel) return null

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
      videoCount: parseInt(channel.statistics.videoCount || '0'),
    }
  } catch (e) {
    console.error('YouTube channel error:', e)
    return null
  }
}

export function isYouTubeConfigured(): boolean {
  return !!YOUTUBE_API_KEY
}

const youtube = {
  searchRustLiveStreams,
  searchRustVideos,
  getVideoDetails,
  getChannelInfo,
  isYouTubeConfigured,
}

export default youtube
