declare module "genius-lyrics-api" {
  export interface GeniusOptions {
    apiKey: string;
    title: string;
    artist: string;
    optimizeQuery?: boolean;
    authHeader?: boolean;
  }

  export interface Song {
    id: number;
    title: string;
    url: string;
    lyrics: string;
    albumArt: string;
  }

  export interface SearchResult {
    id: number;
    url: string;
    title: string;
    albumArt: string;
  }

  export function getLyrics(
    options: GeniusOptions | string
  ): Promise<string | null>;
  export function getAlbumArt(options: GeniusOptions): Promise<string | null>;
  export function getSong(options: GeniusOptions): Promise<Song | null>;
  export function searchSong(
    options: GeniusOptions
  ): Promise<SearchResult[] | null>;
  export function getSongById(
    id: number | string,
    access_token: string
  ): Promise<Song>;
}
