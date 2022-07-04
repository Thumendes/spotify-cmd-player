import { createKeyPress } from "@utils/keyPress";
import { getSpotifyClient } from "@utils/spotifyClient";
import { App } from "@utils/types/app";
import consola from "consola";
import ora from "ora";
import inquirer from "inquirer";
import chalk from "chalk";
import SpotifyWebApi from "spotify-web-api-node";

export class PlayerApp implements App {
  private client!: SpotifyWebApi;

  async run(): Promise<void> {
    const keyPress = createKeyPress();

    const spinner = ora("Iniciando command player...").start();
    this.client = await getSpotifyClient();
    spinner.succeed(`Seja bem-vindo!`);
    await this.logCommandsToUser();

    // Song data
    keyPress.on("d", { ctrl: true }, async () =>
      this.getSongData().catch(this.handleError).finally(this.logCommandsToUser)
    );

    // Play | Pause
    keyPress.on("p", { ctrl: true }, async () =>
      this.playOrPause().catch(this.handleError.bind(this)).finally(this.logCommandsToUser.bind(this))
    );

    // Volume
    keyPress.on("v", { ctrl: true }, async () =>
      this.setVolume().catch(this.handleError.bind(this)).finally(this.logCommandsToUser.bind(this))
    );

    // Skip
    keyPress.on("s", { ctrl: true }, async () =>
      this.skipSong().catch(this.handleError.bind(this)).finally(this.logCommandsToUser.bind(this))
    );

    // Search for song and play
    keyPress.on("b", { ctrl: true }, async () =>
      this.setSong().catch(this.handleError.bind(this)).finally(this.logCommandsToUser.bind(this))
    );
  }

  async logCommandsToUser() {
    const data = await this.client.getMe();

    consola.success(`Olá, ${data.body.display_name}`);
    consola.log(`${chalk.bold("Ctrl + D")} para saber os dados da música atual!`);
    consola.log(`${chalk.bold("Ctrl + P")} para pausar/tocar a música!`);
    consola.log(`${chalk.bold("Ctrl + V")} para mudar o volume!`);
    consola.log(`${chalk.bold("Ctrl + S")} para pular!`);
    consola.log(`${chalk.bold("Ctrl + B")} para buscar uma música e tocar!`);
  }

  async getSongData() {
    consola.log("Busca dados de músicas");
    const data = await this.client.getMyCurrentPlaybackState();
    console.dir(data.body);
  }

  async playOrPause() {
    const { body } = await this.client.getMyCurrentPlaybackState();

    if (body.is_playing) {
      await this.client.pause();
      consola.info("Pausando!");
    } else {
      await this.client.play();
      consola.info("Tocando!");
    }
  }

  async setVolume() {
    consola.log("Volume");
    const { body } = await this.client.getMyCurrentPlaybackState();
    const {
      device: { volume_percent },
    } = body;

    const { volume } = await inquirer.prompt([
      {
        type: "number",
        name: "volume",
        message: "Digite o volume",
        default: volume_percent,
      },
    ]);

    await this.client.setVolume(volume);
  }

  async skipSong() {
    consola.log("Skip");

    const { direction } = await inquirer.prompt([
      {
        type: "list",
        name: "direction",
        message: "Pular para",
        choices: [
          { name: "Próxima", value: "next" },
          { name: "Anterior", value: "previous" },
        ],
      },
    ]);

    direction === "next" ? await this.client.skipToNext() : await this.client.skipToPrevious();
  }

  async setSong() {
    consola.log("Search for song and play");
    const { song } = await inquirer.prompt([
      {
        type: "input",
        name: "song",
        message: "Digite o nome da música",
      },
    ]);
    const { body } = await this.client.searchTracks(song);
    const { tracks } = body;
    if (!tracks) {
      consola.log("Nenhuma música encontrada");
      return;
    }
    const { items } = tracks;

    const { trackId } = await inquirer.prompt([
      {
        type: "list",
        name: "trackId",
        message: "Selecione a música",
        choices: items.map((item) => ({
          name: `${item.name} - ${item.artists[0].name}`,
          value: item.id,
        })),
      },
    ]);

    await this.client.play({ context_uri: `spotify:track:${trackId}` });
  }

  handleError(error: Error) {
    consola.error(error);
  }
}
