import { getSpotifyClient } from "@utils/spotifyClient";
import { App } from "@utils/types/app";
import ora from "ora";
import consola from "consola";
import chalk from "chalk";
import SpotifyWebApi from "spotify-web-api-node";
import { createKeyPress } from "@utils/keyPress";
import { promises as fs } from "fs";
import { sleep } from "@utils/general";

const playlists = ["3IKxoMs3dVHNadDn3Wg8bm", "2FjkBrsAjlwQWe3Ot2GxC0", "2VZUaHN69A4TWExsHXb2Pq"];

interface Track {
  id: string;
  name: string;
  artists: SpotifyApi.ArtistObjectSimplified[];
}

export class ManageApp implements App {
  private client!: SpotifyWebApi;

  async run() {
    createKeyPress();
    const loadingSpinner = ora("Iniciando command player...").start();
    this.client = await getSpotifyClient();
    loadingSpinner.succeed(`Seja bem-vindo!`);

    try {
      const [playlistTracks, savedTracks] = await Promise.all([
        ...playlists.map(async (playlistId) => {
          return await this.getPlaylistTracks(playlistId);
        }),
        this.getSavedTracks(),
      ]);
      const tracks = [...playlistTracks, ...savedTracks];
      await this.analyze(tracks);
    } catch (error) {
      consola.error(error);
    }
  }

  async analyze(tracks: Track[]) {
    consola.info("Tracks:", tracks.length);
    const analyzeSpinner = ora("Analisando tracks...").start();

    const data: Record<string, number> = {};
    for (const [index, track] of tracks.entries()) {
      const [principalArtistData] = track.artists;
      const { body: artist } = await this.client.getArtist(principalArtistData.id);
      const artistLog = track.artists.map((artist) => artist.name).join(", ");
      analyzeSpinner.text = `Analisando track ${index + 1} de ${tracks.length} | ${chalk.bold(
        artistLog
      )} - ${chalk.bold(track.name)}`;

      artist.genres.forEach((genre) => {
        if (!data[genre]) data[genre] = 0;
        data[genre]++;
      });
    }

    analyzeSpinner.succeed("Análise concluída!");
    // Order by most popular

    const orderedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

    fs.writeFile("data.json", JSON.stringify(orderedData, null, 2));
  }

  async getPlaylistTracks(playlistId: string, accTracks: Track[] = [], page = 1): Promise<Track[]> {
    const options = { limit: 100, offset: (page - 1) * 100 };
    const { body: playlist } = await this.client.getPlaylistTracks(playlistId, options);

    accTracks.push(
      ...(playlist.items
        .map(({ track }) => {
          if (!track) return null;

          const data: Track = {
            id: track.id,
            name: track.name,
            artists: track.artists,
          };

          return data;
        })
        .filter(Boolean) as Track[])
    );

    if (playlist.next) {
      await sleep(200);
      return await this.getPlaylistTracks(playlistId, accTracks, page + 1);
    }

    return accTracks;
  }

  async getSavedTracks(accTracks: Track[] = [], page = 1): Promise<Track[]> {
    const options = { limit: 20, offset: (page - 1) * 20 };
    const { body: savedTracks } = await this.client.getMySavedTracks(options);

    accTracks.push(
      ...(savedTracks.items
        .map(({ track }) => {
          if (!track) return null;

          const data: Track = {
            id: track.id,
            name: track.name,
            artists: track.artists,
          };

          return data;
        })
        .filter(Boolean) as Track[])
    );

    if (savedTracks.next) {
      await sleep(200);
      return await this.getSavedTracks(accTracks, page + 1);
    }

    return accTracks;
  }
}
