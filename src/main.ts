import "@utils/prepare";

import { program } from "commander";

program.command("player").action(async () => {
  const { PlayerApp } = await import("@app/player");
  const app = new PlayerApp();
  await app.run();
});

program.command("manage").action(async () => {
  const { ManageApp } = await import("@app/manage");
  const app = new ManageApp();
  await app.run();
});

program.command("playlist").action(async () => {
  const { PlaylistApp } = await import("@app/playlist");
  const app = new PlaylistApp();
  await app.run();
});

program.parse();
