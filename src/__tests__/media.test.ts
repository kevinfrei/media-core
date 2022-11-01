import { Attributes, Metadata } from '../index';
import { AddPattern } from '../media';
import { isAlbumKey, isArtistKey, isSongKey } from '../schema';
const log = false ? console.log : (a: unknown) => {};

it('Generic path', () => {
  const filename = 'something/artist - 1983 - album/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Generic path with a disk number', () => {
  const filename = 'something/player - 1983 - record/1234 - name.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'player',
    year: '1983',
    album: 'record',
    track: '34',
    title: 'name',
    discNum: '12',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'player',
    year: 1983,
    album: 'record',
    track: 34,
    disk: 12,
    title: 'name',
  });
});

it('Generic path, Two Primary artists', () => {
  const filename =
    'something/artist 1 & artist 2 - 1983 - album/101 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1 & artist 2',
    year: '1983',
    album: 'album',
    track: '01',
    discNum: '1',
    title: 'title',
  });
  log(md);
  delete (md as unknown as Attributes).discNum;
  (md as unknown as Attributes).track = '101';
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2'],
    year: 1983,
    album: 'album',
    track: 1,
    disk: 1,
    title: 'title',
  });
});

it('Generic path, Multiple Primary artists', () => {
  const filename =
    'something/artist 1, artist 2, artist 3 & artist 4 - 1983 - album/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1, artist 2, artist 3 & artist 4',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2', 'artist 3', 'artist 4'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Generic path, no year', () => {
  const filename = 'something/artist - album/01 - title.mp3';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Generic path, other artist', () => {
  const filename =
    'something/artist - 1983 - album/02 - title [feat- Other Artist].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
  });
});

it('Generic path, 2 other artists', () => {
  const filename =
    'something/artist - 1983 - album/02 - title [feat- Other Artist 1 & Other Artist 2].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1 & Other Artist 2]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2'],
  });
});

it('Generic path, multiple other artists', () => {
  const filename =
    'something/artist - 1983 - album/02 - title [feat- Other Artist 1, Other Artist 2 & Other Artist 3].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1, Other Artist 2 & Other Artist 3]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2', 'Other Artist 3'],
  });
});

it('VA, other artist', () => {
  const filename =
    'something/VA - 1983 - album/02 - artist - title [with Other Artist].flac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    compilation: 'va',
    track: '02',
    title: 'title [with Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'va',
  });
});

it('Soundtrack, other artist', () => {
  const filename =
    'something/Soundtrack - 2001 - album/02 - artist - title [featuring Other Artist].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    compilation: 'ost',
    track: '02',
    title: 'title [featuring Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'ost',
  });
});

it('variation', () => {
  const filename =
    'something/artist - 2001 - album/02 - title [live][goofy remix].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title [live][goofy remix]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    variations: ['live', 'goofy remix'],
  });
});

it('variation with additional artist', () => {
  const filename =
    'something/artist - 2001 - album/02 - title [live][goofy remix] [feat- foobar].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title [live][goofy remix] [feat- foobar]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['foobar'],
    variations: ['live', 'goofy remix'],
  });
});

it('variation with additional artist and spaces', () => {
  const filename =
    'something/artist - 2001 - album/02 - title  [live]  [feat- foobar]  [goofy remix] .flac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title  [live]  [feat- foobar]  [goofy remix] ',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['foobar'],
    variations: ['live', 'goofy remix'],
  });
});

// Artist-based directories

it('Nested path', () => {
  const filename = 'something/artist/1983 - album/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Nested path with a disk number', () => {
  const filename = 'something/player/1983 - record/1234 - name.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'player',
    year: '1983',
    album: 'record',
    track: '34',
    title: 'name',
    discNum: '12',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'player',
    year: 1983,
    album: 'record',
    track: 34,
    disk: 12,
    title: 'name',
  });
});

it('Nested path, Two Primary artists', () => {
  const filename = 'something/artist 1 & artist 2/1983 - album/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1 & artist 2',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Nested path, Multiple Primary artists', () => {
  const filename =
    'something/artist 1, artist 2, artist 3 & artist 4/1983 - album/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1, artist 2, artist 3 & artist 4',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2', 'artist 3', 'artist 4'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Nested path, no year', () => {
  const filename = 'something/artist/album/01 - title.mp3';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    album: 'album',
    track: 1,
    title: 'title',
  });
});

it('Nested path, other artist', () => {
  const filename =
    'something/artist/1983 - album/02 - title [feat- Other Artist].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
  });
});

it('Nested path, 2 other artists', () => {
  const filename =
    'something/artist/1983 - album/02 - title [feat- Other Artist 1 & Other Artist 2].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1 & Other Artist 2]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2'],
  });
});

it('Nested path, multiple other artists', () => {
  const filename =
    'something/artist/1983 - album/02 - title [feat- Other Artist 1, Other Artist 2 & Other Artist 3].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1, Other Artist 2 & Other Artist 3]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2', 'Other Artist 3'],
  });
});

it('Nested VA, other artist', () => {
  const filename =
    'something/VA/1983 - album/02 - artist - title [with Other Artist].flac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    compilation: 'va',
    track: '02',
    title: 'title [with Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'va',
  });
});

it('Nested Soundtrack, other artist', () => {
  const filename =
    'something/Soundtrack/2001 - album/02 - artist - title [featuring Other Artist].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    compilation: 'ost',
    track: '02',
    title: 'title [featuring Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'ost',
  });
});

it('Nested variation', () => {
  const filename =
    'something/artist/2001 - album/02 - title [live][goofy remix].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title [live][goofy remix]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    variations: ['live', 'goofy remix'],
  });
});

it('Nested variation with additional artist', () => {
  const filename =
    'something/artist/2001 - album/02 - title [live][goofy remix] [feat- foobar].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title [live][goofy remix] [feat- foobar]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['foobar'],
    variations: ['live', 'goofy remix'],
  });
});

it('Nested variation with additional artist and spaces', () => {
  const filename =
    'something/artist/2001 - album/02 - title  [live]  [feat- foobar]  [goofy remix] .flac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title  [live]  [feat- foobar]  [goofy remix] ',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['foobar'],
    variations: ['live', 'goofy remix'],
  });
});

// Disc names & numbers

it('Disc Number path', () => {
  const filename =
    'something/artist/1983 - album/cd 3- silliness/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
    discNum: '3',
    discName: 'silliness',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
    disk: 3,
    diskName: 'silliness',
  });
});

it('Nested path with a disk number', () => {
  const filename =
    'something/player/1983 - record/disc 2 stuff/1234 - name.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'player',
    year: '1983',
    album: 'record',
    track: '1234',
    title: 'name',
    discNum: '2',
    discName: 'stuff',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'player',
    year: 1983,
    album: 'record',
    track: 1234,
    disk: 2,
    title: 'name',
    diskName: 'stuff',
  });
});

it('Generic path, Two Primary artists, disc number', () => {
  const filename =
    'something/artist 1 & artist 2 - 1983 - album/CD 3/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1 & artist 2',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
    discNum: '3',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
    disk: 3,
  });
});

it('Generic path, Multiple Primary artists, disc name', () => {
  const filename =
    'something/artist 1, artist 2, artist 3 & artist 4 - 1983 - album/Disc 2- disk Name/01 - title.m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1, artist 2, artist 3 & artist 4',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
    discNum: '2',
    discName: 'disk Name',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2', 'artist 3', 'artist 4'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
    disk: 2,
    diskName: 'disk Name',
  });
});

it('Nested path, no year, disc id', () => {
  const filename = 'something/artist/album/cd 14- this one/01 - title.mp3';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    album: 'album',
    track: '01',
    title: 'title',
    discNum: '14',
    discName: 'this one',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    album: 'album',
    track: 1,
    title: 'title',
    disk: 14,
    diskName: 'this one',
  });
});

it('Nested path, other artist, disc number', () => {
  const filename =
    'something/artist/1983 - album/disk 12/02 - title [feat- Other Artist].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist]',
    discNum: '12',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    disk: 12,
    title: 'title',
    moreArtists: ['Other Artist'],
  });
});

it('Generic path, 2 other artists, disc name', () => {
  const filename =
    'something/artist - 1983 - album/cd 3- The Disk Name/02 - title [feat- Other Artist 1 & Other Artist 2].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1 & Other Artist 2]',
    discNum: '3',
    discName: 'The Disk Name',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2'],
    disk: 3,
    diskName: 'The Disk Name',
  });
});

it('Nested path, multiple other artists, disk number', () => {
  const filename =
    'something/artist/1983 - album/Cd 1234/02 - title [feat- Other Artist 1, Other Artist 2 & Other Artist 3].aac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1, Other Artist 2 & Other Artist 3]',
    discNum: '1234',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    disk: 1234,
    moreArtists: ['Other Artist 1', 'Other Artist 2', 'Other Artist 3'],
  });
});

it('Nested VA, other artist, disk name', () => {
  const filename =
    'something/VA/1983 - album/CD 15 moar stuff/02 - artist - title [with Other Artist].flac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    compilation: 'va',
    track: '02',
    title: 'title [with Other Artist]',
    discNum: '15',
    discName: 'moar stuff',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    disk: 15,
    diskName: 'moar stuff',
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'va',
  });
});

it('Nested Soundtrack, other artist, disk num', () => {
  const filename =
    'something/Soundtrack/2001 - album/disc 12/02 - artist - title [featuring Other Artist].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    compilation: 'ost',
    track: '02',
    discNum: '12',
    title: 'title [featuring Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'ost',
    disk: 12,
  });
});

it('Nested variation, disc name', () => {
  const filename =
    'something/artist/2001 - album/cd 1- disk name/02 - title [live][goofy remix].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title [live][goofy remix]',
    discNum: '1',
    discName: 'disk name',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    variations: ['live', 'goofy remix'],
    disk: 1,
    diskName: 'disk name',
  });
});

it('Nested variation with additional artist, disk num', () => {
  const filename =
    'something/artist/2001 - album/cd 3/02 - title [live][goofy remix] [feat- foobar].m4a';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    title: 'title [live][goofy remix] [feat- foobar]',
    discNum: '3',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    disk: 3,
    title: 'title',
    moreArtists: ['foobar'],
    variations: ['live', 'goofy remix'],
  });
});

it('Nested variation with additional artist and spaces, disk name', () => {
  const filename =
    'something/artist/2001 - album/disc 3- discName/02 - title  [live]  [feat- foobar]  [goofy remix] .flac';
  const md = Metadata.FromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    track: '02',
    discNum: '3',
    discName: 'discName',
    title: 'title  [live]  [feat- foobar]  [goofy remix] ',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    disk: 3,
    diskName: 'discName',
    title: 'title',
    moreArtists: ['foobar'],
    variations: ['live', 'goofy remix'],
  });
});

it('Artist Splitting', () => {
  const art1 = 'Artist #1 & Artist #2';
  const spl1 = Metadata.SplitArtistString(art1);
  expect(spl1).toEqual(['Artist #1', 'Artist #2']);
  const art2 = 'Artist 1, Artist 2 & Artist 3';
  const spl2 = Metadata.SplitArtistString(art2);
  expect(spl2).toEqual(['Artist 1', 'Artist 2', 'Artist 3']);
  const art3 = 'Artist 1, Artist 2';
  const spl3 = Metadata.SplitArtistString(art3);
  expect(spl3).toEqual([art3]);
});

it('Simple schema tests', () => {
  expect(isArtistKey('R123')).toBeTruthy();
  expect(isArtistKey('L123')).toBeFalsy();
  expect(isArtistKey('S123')).toBeFalsy();
  expect(isAlbumKey('L123')).toBeTruthy();
  expect(isAlbumKey('R123')).toBeFalsy();
  expect(isAlbumKey('S123')).toBeFalsy();
  expect(isSongKey('S123')).toBeTruthy();
  expect(isSongKey('L123')).toBeFalsy();
  expect(isSongKey('R123')).toBeFalsy();
});

it('FullFromObj failure', () => {
  const filename =
    'something/artist 1 & artist 2 - 1983 - album/101 - title.m4a';
  const md = Metadata.FromPath(filename);
  delete (md as unknown as Attributes).album;
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toBeUndefined();
});

it('AlbumArtist vs moreArtists', () => {
  const filename =
    'something/artist 1 - 1983 - album/101 - title [w- artist 2].m4a';
  const md = Metadata.FromPath(filename);
  console.log(md);
  (md as unknown as Attributes).moreArtists = 'artist 3';
  (md as unknown as Attributes).albumArtist = 'artist 2';
  const fmd = Metadata.FullFromObj(filename, md as unknown as Attributes);
  expect(fmd).toEqual({
    album: 'album',
    artist: 'artist 2',
    disk: 1,
    originalPath: filename,
    title: 'title',
    track: 1,
    year: 1983,
    moreArtists: ['artist 2', 'artist 1', 'artist 3'],
  });
});

it('AddPattern test', () => {
  const filepath = '/artist-2022-album-23-title.flac';
  const mdFail = Metadata.FromPath(filepath);
  expect(mdFail).toBeUndefined();
  AddPattern(
    /^(.*\/)?(?<artist>[^\/]+)-(?<year>\d{4})-(?<album>[^\/]+)-(?<track>\d+)[-\. ]+(?<title>[^\/]+)$/i,
  );
  const mdSuccess = Metadata.FromPath(filepath);
  expect(mdSuccess).toEqual({
    album: 'album',
    artist: 'artist',
    year: '2022',
    track: '23',
    title: 'title',
  });
});
// TODO: AddPattern,
