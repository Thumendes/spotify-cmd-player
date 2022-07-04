import { createKeyPress } from "@utils/keyPress";
import { getSpotifyClient } from "@utils/spotifyClient";
import { App } from "@utils/types/app";
import ora from "ora";
import SpotifyWebApi from "spotify-web-api-node";
import globby from "globby";
import consola from "consola";
import chalk from "chalk";
import { faker } from "@faker-js/faker";
import * as mm from "music-metadata";
import { chunk } from "@utils/general";

export class PlaylistApp implements App {
  private client!: SpotifyWebApi;

  async run() {
    createKeyPress();
    const spinner = ora("Iniciando command player...").start();
    this.client = await getSpotifyClient();
    spinner.succeed(`Seja bem-vindo!`);

    const files = await globby("*.mp3", { cwd: "D:/TRILHA SONORA" });
    const songs = await Promise.all(
      files.map(async (file) => {
        const metadata = await mm.parseFile(`D:/TRILHA SONORA/${file}`);

        return `${metadata.common.title}${metadata.common.artist ? ` ${metadata.common.artist}` : ""}`;
      })
    );

    const tracks: string[] = [];

    for (const [index, song] of songs.entries()) {
      const trackId = await this.client
        .searchTracks(song)
        .then(({ body }) => {
          if (!body.tracks) return;
          const [track] = body.tracks.items;
          consola.success(
            `${chalk.gray(`${index} de ${songs.length}`)} - ${chalk.green("+")} ${chalk.bold(
              track.name
            )} | ${chalk.bold(track.artists[0].name)}`
          );

          return `spotify:track:${track.id}`;
        })
        .catch(() => {
          consola.info(`${chalk.red("-")} ${chalk.bold(song)}`);
        });

      if (!trackId) continue;

      tracks.push(trackId);
    }

    consola.info(`Adicionando ${tracks.length} músicas a playlist...`);

    const { body: playlist } = await this.client.createPlaylist(faker.git.branch());
    consola.info(`Playlist criada com sucesso: ${playlist.name}`);

    for (const tracksChunk of chunk(tracks, 100)) {
      await this.client.addTracksToPlaylist(playlist.id, tracksChunk).catch(consola.error);
    }

    consola.info(`Playlist ${playlist.name} adicionada com sucesso!`);
  }
}
