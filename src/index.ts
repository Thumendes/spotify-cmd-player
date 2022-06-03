import "./utils/prepare";

import ora from "ora";
import { createKeyPress } from "./utils/KeyPress";
import { getSpotifyClient } from "./utils/spotifyClient";

async function main() {
  const spinner = ora("Iniciando command player...").start();

  const keyPress = createKeyPress();
  const spotifyApi = await getSpotifyClient();
  const data = await spotifyApi.getMe();

  spinner.succeed(`Bem vindo, ${data.body.display_name}`);

  console.log("Aperte 'c' para saber os dados da música atual!");
  console.log("Aperte 'Ctrl + p' para pausar/tocar a música!");

  keyPress.on("c", async () => {
    try {
      console.log("Busca dados de músicas");
      const data = await spotifyApi.getMyCurrentPlaybackState();
      console.log(data.body);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  });

  // Play | Pause
  keyPress.on("p", { ctrl: true }, async () => {
    try {
      console.log("Play ou Pause");
      const { body } = await spotifyApi.getMyCurrentPlaybackState();
      const { is_playing } = body;
      is_playing ? await spotifyApi.pause() : await spotifyApi.play();
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
