import {
  chkArrayOf,
  chkObjectOfType,
  chkOneOf,
  isArrayOfString,
  isMapOfStrings,
  isNumber,
  isString,
} from '@freik/typechk';

export type SongKey = string;
export type AlbumKey = string;
export type ArtistKey = string;
export type MediaKey = SongKey | ArtistKey | AlbumKey;
export type PlaylistName = string;
export type Playlist = SongKey[];

export type Song = {
  key: SongKey;
  track: number;
  title: string;
  albumId: AlbumKey;
  artistIds: ArtistKey[];
  secondaryIds: ArtistKey[];
  variations?: string[];
};

export type SongObj = {
  track: number;
  title: string;
  album: AlbumObj;
  artists: ArtistObj[];
  secondaryArtists: ArtistObj[];
  variations?: string[];
};

export type ArtistObj = {
  name: string;
  albums: AlbumObj[];
  songs: SongObj[];
};

export type AlbumObj = {
  title: string;
  year: number;
  vatype: '' | 'va' | 'ost';
  primaryArtists: ArtistObj[];
  songs: SongObj[];
  diskNames?: string[];
};

export type Artist = {
  key: ArtistKey;
  name: string;
  albums: AlbumKey[];
  songs: SongKey[];
};

export type Album = {
  key: AlbumKey;
  year: number;
  title: string;
  vatype: '' | 'va' | 'ost';
  primaryArtists: ArtistKey[];
  songs: SongKey[];
  diskNames?: string[];
};

export type MediaInfo = {
  general: Map<string, string>;
  audio: Map<string, string>;
};

// This is a helper type used in a few places
export type Attributes = { [key: string]: string };

// This is the most simplistic strongly typed metadata you'll find
export type SimpleMetadata = {
  artist: string;
  album: string;
  year?: string;
  track: string;
  title: string;
  discNum?: string;
  discName?: string;
  compilation?: 'va' | 'ost';
};

// This is a more robust metadata type, meant to be used in,
// among other scenarios, situations where you're moving files around
export type FullMetadata = {
  originalPath: string;
  artist: string[] | string;
  album: string;
  year?: number;
  track: number;
  title: string;
  vaType?: 'va' | 'ost';
  moreArtists?: string[];
  variations?: string[];
  disk?: number;
  diskName?: string;
};

// This is a general mechanism for describing how to extract
// various metadata components out of a file path
export type AudioFileRegexPattern = {
  // This can be something like "soundtrack"
  // or "true/false" to simply indicate that it's
  // a compilation of works by various artists
  compilation?: string;
  // This is the regular expression to match
  rgx: RegExp;
};

export type MimeData = {
  type: string;
  data: string;
};

export function isArtistKey(mediaKey: unknown): mediaKey is ArtistKey {
  return isString(mediaKey) && mediaKey.startsWith('R');
}

export function isAlbumKey(mediaKey: unknown): mediaKey is ArtistKey {
  return isString(mediaKey) && mediaKey.startsWith('L');
}

export function isSongKey(mediaKey: unknown): mediaKey is ArtistKey {
  return isString(mediaKey) && mediaKey.startsWith('S');
}

export const isPlaylist = chkArrayOf(isSongKey);

export function isOnlyVaType(obj: unknown): obj is 'va' | 'ost' {
  return obj === 'va' || obj === 'ost';
}

export function isVaType(obj: unknown): obj is 'va' | 'ost' | '' {
  return obj === '' || isOnlyVaType(obj);
}

export const isSong = chkObjectOfType<Song>(
  {
    key: isSongKey,
    track: isNumber,
    title: isString,
    albumId: isAlbumKey,
    artistIds: chkArrayOf(isArtistKey),
    secondaryIds: chkArrayOf(isArtistKey),
  },
  { variations: isArrayOfString },
);

export const isArtist = chkObjectOfType<Artist>({
  key: isArtistKey,
  name: isString,
  albums: chkArrayOf(isAlbumKey),
  songs: isPlaylist,
});

export const isAlbum = chkObjectOfType<Album>(
  {
    key: isAlbumKey,
    year: isNumber,
    title: isString,
    vatype: isVaType,
    primaryArtists: chkArrayOf(isArtistKey),
    songs: isPlaylist,
  },
  { diskNames: isArrayOfString },
);

export const isMediaInfo = chkObjectOfType<MediaInfo>({
  general: isMapOfStrings,
  audio: isMapOfStrings,
});

export const isSimpleMetadata = chkObjectOfType<SimpleMetadata>(
  {
    artist: isString,
    album: isString,
    track: isString,
    title: isString,
  },
  {
    year: isString,
    discNum: isString,
    discName: isString,
    compilation: isOnlyVaType,
  },
);

export const isFullMetadata = chkObjectOfType<FullMetadata>(
  {
    originalPath: isString,
    artist: chkOneOf(isArrayOfString, isString),
    album: isString,
    track: isNumber,
    title: isString,
  },
  {
    year: isNumber,
    vaType: isOnlyVaType,
    moreArtists: isArrayOfString,
    variations: isArrayOfString,
    disk: isNumber,
    diskName: isString,
  },
);
