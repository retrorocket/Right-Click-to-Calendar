"use strict";

const CLIENT_ID =
  "94384066361-kgpm35l8cdcn4kqrd09tob7sssulnj1c.apps.googleusercontent.com";
const AUTH_URL = "https://client2.retrorocket.biz/try";
const ERROR_MESSAGE =
  "アクセストークンを取得できませんでした。承認用のウインドウを閉じてオプションページから再度登録を行ってください。";
const tokenRefresh = () => {
  chrome.identity.launchWebAuthFlow(
    {
      url: AUTH_URL,
      interactive: true,
    },
    (responseUrl) => {
      if (chrome.runtime.lastError) {
        alert(ERROR_MESSAGE);
        return;
      }
      const hash = new URL(responseUrl).hash;
      const state = new URLSearchParams(hash);
      if (state.has("#token")) {
        chrome.storage.local.set({ accessToken: state.get("#token") });
      } else {
        alert(ERROR_MESSAGE);
      }
    }
  );
};

export const checkToken = (accessToken) => {
  return fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("invalid token");
      }
      return response.json();
    })
    .then((data) => {
      if (data.aud && data.aud === CLIENT_ID) {
        return data;
      } else {
        throw new Error("invalid token");
      }
    })
    .catch(() => {
      tokenRefresh();
      throw new Error("need token refresh");
    });
};
