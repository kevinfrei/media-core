import {
  chkObjectOfType,
  hasStrField,
  isString,
  typecheck,
} from '@freik/typechk';
import {
  Attributes,
  AudioFileRegexPattern,
  FullMetadata,
  SimpleMetadata,
} from './schema.js';

// My "schema" for music that I use in other places:

const patterns: AudioFileRegexPattern[] = [
  // va - (year - )albumTitle/(disc #- disc name/)## - artist - track title.flac
  {
    compilation: 'va',
    rgx: /^(.*\/)?((va(rious artists)?)|(compilation)) - ((?<year>\d{4}) - )?(?<album>[^\/]+)(\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?)?\/(?<track>\d+)[-\. ]+(?<artist>[^\/]+) - (?<title>[^\/]+)$/i,
  },
  // soundtrack - (year - )albumTitle/(disc #- disc name/)## - artist - track title.flac
  {
    compilation: 'ost',
    rgx: /^(.*\/)?((ost)|(soundtrack)) - ((?<year>\d{4}) - )?(?<album>[^\/]+)(\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?)?\/(?<track>\d+)[-\. ]+(?<artist>[^\/]+) - (?<title>[^\/]+)$/i,
  },
  // artist - year - album/(disc #- disc name/)## - track title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+) - (?<year>\d{4}) - (?<album>[^\/]+)(\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?)?\/(?<track>\d+)[-\. ]+(?<title>[^\/]+)$/i,
  },
  // va/(year - )albumTitle/(CD # name/)## - artist - track-title.flac
  {
    compilation: 'va',
    rgx: /^(.*\/)?((va(rious artists)?)|(compilation))\/((?<year>\d{4}) - )?(?<album>[^\/]+)(\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?)?\/(?<track>\d+)[-\. ]+(?<artist>[^\/]+) - (?<title>[^\/]+)$/i,
  },
  // ost/(year - )albumTitle/(CD # name/)## - artist - track-title.flac
  {
    compilation: 'ost',
    rgx: /^(.*\/)?((ost)|(soundtrack))\/((?<year>\d{4}) - )?(?<album>[^\/]+)(\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?)?\/(?<track>\d+)[-\. ]+(?<artist>[^\/]+) - (?<title>[^\/]+)$/i,
  },
  // artist/year - albumTitle/CD # name/## - track-title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+)\/(?<year>\d{4}) - (?<album>[^\/]+)\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?\/(?<track>\d+)[-\. ]+ (?<title>[^\/]+)$/i,
  },
  // artist/year - albumTitle/## - track-title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+)\/(?<year>\d{4}) - (?<album>[^\/]+)\/(?<track>\d+)[-\. ]+ (?<title>[^\/]+)$/i,
  },
  // artist - album/CD # name/## - track title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+) - (?<album>[^\/]+)\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?\/(?<track>\d+)[-\. ]+(?<title>[^\/]+)$/i,
  },
  // artist/albumTitle/CD # name/## - track-title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+)\/(?<album>[^\/]+)\/(cd|dis[ck]) *(?<discNum>\d+)(-? +(?<discName>[^ \/][^\/]+))?\/(?<track>\d+)[-\. ]+ (?<title>[^\/]+)$/i,
  },
  // artist - album/## - track title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+) - (?<album>[^\/]+)\/(?<track>\d+)[-\. ]+(?<title>[^\/]+)$/i,
  },
  // artist/albumTitle/## - track-title.flac
  {
    rgx: /^(.*\/)?(?<artist>[^\/]+)\/(?<album>[^\/]+)\/(?<track>\d+)[-\. ]+ (?<title>[^\/]+)$/i,
  },
];

function getExtension(pathname: string): string {
  const dot = pathname.lastIndexOf('.');
  /* istanbul ignore next */
  return dot >= 0 ? pathname.substring(dot + 1) : '';
}

export function AddPattern(rgx: RegExp, compilation?: 'ost' | 'va'): void {
  patterns.push(compilation ? { rgx, compilation } : { rgx });
}

export const isSimpleMetadata: typecheck<SimpleMetadata> =
  chkObjectOfType<SimpleMetadata>(
    {
      artist: isString,
      album: isString,
      title: isString,
      track: isString,
    },
    {
      year: isString,
      discNum: isString,
      discName: isString,
      compilation: (va: unknown) => va === 'va' || va === 'ost',
    },
  );

export function FromPath(pthnm: string): SimpleMetadata | void {
  let pathname = pthnm.replace(/\\/g, '/');

  const theExtension: string = getExtension(pathname);
  /* istanbul ignore if */
  if (!theExtension || theExtension.length < 3) {
    return;
  }
  pathname = pathname.substring(0, pathname.length - 1 - theExtension.length);
  for (const pattern of patterns) {
    if (!pattern.rgx.test(pathname)) {
      continue;
    }
    const match = pattern.rgx.exec(pathname);
    /* istanbul ignore if */
    if (!match) {
      continue;
    }
    const result: { [key: string]: string } = {};
    for (const attr in match.groups) {
      if (isString(attr) && hasStrField(match.groups, attr)) {
        result[attr] = match.groups[attr];
      }
    }
    if (isString(pattern.compilation)) {
      result.compilation = pattern.compilation;
    }
    // If we don't have an explicit disk number, and the track number is over
    // 100, trim the track number and set the disk number
    if (
      hasStrField(match.groups, 'track') &&
      !hasStrField(match.groups, 'discNum') &&
      match.groups.track.length > 2
    ) {
      result.discNum = match.groups.track.substr(
        0,
        match.groups.track.length - 2,
      );
      result.track = match.groups.track.substr(result.discNum.length);
    }
    if (isSimpleMetadata(result)) {
      return result;
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
  /* istanbul ignore next */
  if (
    !(hasStrField(data, 'artist') || hasStrField(data, 'albumArtist')) ||
    !hasStrField(data, 'album') ||
    !hasStrField(data, 'track') ||
    !hasStrField(data, 'title')
  ) {
    return;
  }
  const theArtist = hasStrField(data, 'albumArtist')
    ? data.albumArtist
    : data.artist;
  const artistArray = SplitArtistString(theArtist);
  res.artist = artistArray.length > 1 ? artistArray : theArtist;
  res.album = data.album;
  const track = Number.parseInt(data.track, 10);
  if (hasStrField(data, 'discNum')) {
    res.track = track;
    res.disk = Number.parseInt(data.discNum, 10);
  } else {
    res.track = track % 100;
    if (res.track !== track) {
      res.disk = Math.floor(track / 100);
    }
  }
  const { title: aTitle, artists } = pullArtistsFromTitle(data.title);
  res.moreArtists = artists;
  const { title, variations } = pullVariationsFromTitle(aTitle);
  res.title = title;
  res.variations = variations;

  // Now add any additional data we've got
  if (hasStrField(data, 'year')) {
    res.year = Number.parseInt(data.year, 10);
  }
  if (hasStrField(data, 'artist') && hasStrField(data, 'albumArtist')) {
    if (data.artist !== data.albumArtist && res.moreArtists) {
      res.moreArtists.push(data.artist);
    }
  }
  /* istanbul ignore else */
  if (hasStrField(data, 'moreArtists') && res.moreArtists) {
    res.moreArtists = [...res.moreArtists, data.moreArtists];
  } else if (res.moreArtists && res.moreArtists.length === 0) {
    delete res.moreArtists;
  }
  if (hasStrField(data, 'compilation')) {
    if (data.compilation === 'va') {
      res.vaType = 'va';
    } else if (data.compilation === 'ost') {
      res.vaType = 'ost';
    }
  }
  if (hasStrField(data, 'discName')) {
    res.diskName = data.discName;
  }
  return res;
}
