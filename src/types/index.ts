export interface Song {
  id: string;
  title: string;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}
