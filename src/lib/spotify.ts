const SPOTIFY_LINK =
  /open\.spotify\.com\/(?:intl-[a-z-]+\/)?(album|track|playlist)\/([A-Za-z0-9]+)/;

/** Turns a share link (open.spotify.com/album/...) into a spotify: URI. */
export function toSpotifyUri(url: string) {
  const match = url.match(SPOTIFY_LINK);
  if (!match) throw new Error(`Not a Spotify album, track or playlist link: ${url}`);
  return `spotify:${match[1]}:${match[2]}`;
}

/**
 * Cover art through Spotify's public oEmbed endpoint, so adding a record
 * only takes a link. Returns null rather than failing the page build.
 */
export async function fetchSpotifyCover(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
      { next: { revalidate: 60 * 60 * 24 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}
