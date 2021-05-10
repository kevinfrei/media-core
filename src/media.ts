import { Type } from '@freik/core-utils';
import {
  Attributes,
  FullMetadata,
  AudioFileRegexPattern,
  SimpleMetadata,
} from './schema';

// My "schema" for music that I use in other places:

const patterns: AudioFileRegexPattern[] = [
  {
    compilation: 'va',
    rgx: /^(?:.*\/)?(?:(?:va(?:rious artists)?)) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { year: 1, album: 2, track: 3, artist: 4, title: 5 },
  },
  {
    compilation: 'va',
    rgx: /^(?:.*\/)?(?:(?:va(?:various artists)?)) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { album: 1, track: 2, artist: 3, title: 4 },
  },
  {
    compilation: 'ost',
    rgx: /^(?:.*\/)?(?:(?:ost)|(?:soundtrack)) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { year: 1, album: 2, track: 3, artist: 4, title: 5 },
  },
  {
    compilation: 'ost',
    rgx: /^(?:.*\/)?(?:(?:ost)|(?:soundtrack)) - ([^\/]+)\/(\d+)(?: [-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { album: 1, track: 2, artist: 3, title: 4 },
  },
  {
    rgx: /^(?:.*\/)?([^\/]+) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+)$/i,
    metadata: { artist: 1, year: 2, album: 3, track: 4, title: 5 },
  },
  {
    rgx: /^(?:.*\/)?([^\/]+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+)$/i,
    metadata: { artist: 1, album: 2, track: 3, title: 4 },
  },
];

function getExtension(pathname: string): string {
  const dot = pathname.lastIndexOf('.');
  if (dot >= 0) {
    return pathname.substr(dot + 1);
  } else {
    return '';
  }
}

export function AddPattern(
  rgx: RegExp,
  metadata: { [key: string]: number },
  compilation?: boolean,
): void {
  if (compilation) {
    patterns.push({ rgx, metadata, compilation: true });
  } else {
    patterns.push({ rgx, metadata });
  }
}

export function FromPath(pthnm: string): SimpleMetadata | void {
  let pathname = pthnm.replace(/\\/g, '/');

  // A little helper
  const makeMetaDataFromRegex = (
    pathnm: string,
    pattern: AudioFileRegexPattern,
  ): SimpleMetadata | void => {
    if (!pattern.rgx.test(pathnm)) {
      return;
    }
    const match = pattern.rgx.exec(pathnm);
    if (!match) {
      return;
    }
    const result: { [key: string]: string } = {};
    // Comment syntax because otherwise it confuses syntax highlighting :/
    for (const attr in pattern.metadata) {
      if (Type.has(pattern.metadata, attr)) {
        const index = pattern.metadata[attr];
        result[attr] = match[index];
      }
    }
    if (typeof pattern.compilation === 'string') {
      result.compilation = pattern.compilation;
    } else if (pattern.compilation === true) {
      result.compilation = 'va';
    }
    return result as unknown as SimpleMetadata;
  };

  const theExtension: string = getExtension(pathname);
  if (!theExtension || theExtension.length < 3) {
    return;
  }
  pathname = pathname.substr(0, pathname.length - 1 - theExtension.length);
  for (const pattern of patterns) {
    const result = makeMetaDataFromRegex(pathname, pattern);
    if (result) {
      return result as unknown as SimpleMetadata;
    }
  }
}

const moreArtistsRE =
  /\[(?:(?:w-)|(?:feat-)|(?:with)|(?:featuring)) ([^\]]*)\]/i;
const variationRE = /\[([^\]]+)\]/;

// This should pull the [w- Someone & Somebody else] from the title, and
// stick it in the artists array
function pullArtistsFromTitle(title: string): {
  title: string;
  artists?: string[];
} {
  const match = moreArtistsRE.exec(title);
  if (!match) {
    return { title: title.replace(/  +/g, ' ').trim() };
  }
  const artists = SplitArtistString(match[1]);
  title = title.replace(moreArtistsRE, '').replace(/  +/g, ' ').trim();
  return { title, artists };
}

function pullVariationsFromTitle(title: string): {
  title: string;
  variations?: string[];
} {
  let variations: string[] | undefined;
  let ttl = title;
  while (true) {
    const match = variationRE.exec(ttl);
    if (!match) {
      return { title: ttl, variations };
    }
    if (variations === undefined) {
      variations = [];
    }
    variations.push(match[1]);
    ttl = ttl.replace(variationRE, '').replace(/  +/g, ' ').trim();
  }
}

export function SplitArtistString(artists: string): string[] {
  if (artists.indexOf(' & ') >= 0) {
    return artists
      .split(', ')
      .join(' & ')
      .split(' & ')
      .map((s) => s.trim());
  } else {
    return [artists];
  }
}

export function FullFromObj(
  file: string,
  data: Attributes,
): FullMetadata | void {
  const res: FullMetadata = {
    originalPath: file,
    artist: '',
    album: '',
    track: 0,
    title: '',
  };
  /*
    moreArtists?: string[],
    disk?: number,
    variation?: string[]
    TODO: Deal with variations (mix, live, remix, demo, etc...)
  */
  if (
    !(Type.hasStr(data, 'artist') || Type.hasStr(data, 'albumArtist')) ||
    !Type.hasStr(data, 'album') ||
    !Type.hasStr(data, 'track') ||
    !Type.hasStr(data, 'title')
  ) {
    return;
  }
  const theArtist = Type.hasStr(data, 'albumArtist')
    ? data.albumArtist
    : data.artist;
  const artistArray = SplitArtistString(theArtist);
  res.artist = artistArray.length > 1 ? artistArray : theArtist;
  res.album = data.album;
  const track = Number.parseInt(data.track, 10);
  res.track = track % 100;
  if (res.track !== track) {
    res.disk = Math.floor(track / 100);
  }
  const { title: aTitle, artists } = pullArtistsFromTitle(data.title);
  res.moreArtists = artists;
  const { title, variations } = pullVariationsFromTitle(aTitle);
  res.title = title;
  res.variations = variations;

  // Now add any additional data we've got
  if (Type.hasStr(data, 'year')) {
    res.year = Number.parseInt(data.year, 10);
  }
  if (Type.hasStr(data, 'artist') && Type.hasStr(data, 'albumArtist')) {
    if (data.artist !== data.albumArtist && res.moreArtists) {
      res.moreArtists.push(data.artist);
    }
  }
  if (Type.hasStr(data, 'moreArtists') && res.moreArtists) {
    res.moreArtists = [...res.moreArtists, ...data.moreArtists];
  } else if (res.moreArtists && res.moreArtists.length === 0) {
    delete res.moreArtists;
  }
  if (Type.hasStr(data, 'compilation')) {
    if (data.compilation === 'va') {
      res.vaType = 'va';
    } else if (data.compilation === 'ost') {
      res.vaType = 'ost';
    }
  }
  return res;
}
