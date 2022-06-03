import express from "express";
import { chromium } from "playwright";
import SpotifyWebApi from "spotify-web-api-node";
import { CONSTANTS, scopes } from "../data/constants";

function createRefresher(spotifyApi: SpotifyWebApi, expiresIn: number) {
  setInterval(async () => {
    const data = await spotifyApi.refreshAccessToken();
    const { access_token } = data.body;
    spotifyApi.setAccessToken(access_token);
  }, (expiresIn / 2) * 1000);
}

export function getSpotifyClient() {
  return new Promise<SpotifyWebApi>(async (resolve) => {
    /**
     * Create SpotifyClient
     */
    const redirectUri = `http://localhost:${CONSTANTS.LOGIN_SERVER_PORT}/callback`;
    const spotifyApi = new SpotifyWebApi({
      clientId: CONSTANTS.CLIENT_ID,
      clientSecret: CONSTANTS.CLIENT_SECRET,
      redirectUri,
    });

    /**
     * Create API
     */
    const app = express();

    app.get("/callback", async (req, res) => {
      const { code, error } = req.query;

      if (error) {
        console.error(error);
        return res.status(400).json({ success: false, message: error });
      }

      const data = await spotifyApi.authorizationCodeGrant(code as string);

      const { access_token, refresh_token, expires_in } = data.body;

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      createRefresher(spotifyApi, expires_in);
      resolve(spotifyApi);

      return res.json({ success: true, message: "Login works!" });
    });

    const server = app.listen(CONSTANTS.LOGIN_SERVER_PORT);

    /**
     * Create BOT
     */

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(spotifyApi.createAuthorizeURL(scopes, ""));

    await page.type('[data-testid="login-username"]', CONSTANTS.USER_NAME);
    await page.type('[data-testid="login-password"]', CONSTANTS.USER_PASS);
    await page.click('[data-testid="login-button"]');

    await page.waitForNavigation();
    await browser.close();

    server.close();
  });
}
