export const CONSTANTS = {
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "",
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || "",
  LOGIN_SERVER_PORT: 8888,

  // Login Data
  USER_NAME: process.env.SPOTIFY_USER_NAME || "",
  USER_PASS: process.env.SPOTIFY_USER_PASS || "",
};

export const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];
