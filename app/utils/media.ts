import type { MediaRef } from '~/types/api'

/**
 * Resolve a media URL from the API response.
 * Handles both absolute URLs and relative paths that need the API base prefix.
 *
 * @param media - The media reference from the API
 * @param size - Optional thumbnail size: 'small' (400px), 'medium' (800px), 'large' (1400px)
 * @returns Full URL to the media file, or empty string if no media
 */
export function resolveMediaUrl(media: MediaRef | null | undefined, size?: 'small' | 'medium' | 'large'): string {
  if (!media) return ''

  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase as string

  // Use thumbnail if requested and available
  if (size && media.thumbnails?.[size]) {
    const thumbPath = media.thumbnails[size]
    if (thumbPath.startsWith('http')) return thumbPath
    return `${baseUrl}/storage/media/${thumbPath}`
  }

  // Use original
  const path = media.path
  if (!path) return ''
  if (path.startsWith('http')) return path

  return `${baseUrl}/storage/media/${path}`
}
