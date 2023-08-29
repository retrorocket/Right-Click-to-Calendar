"use strict";

const CLIENT_ID =
  "94384066361-kgpm35l8cdcn4kqrd09tob7sssulnj1c.apps.googleusercontent.com";
const AUTH_URL = "https://client.retrorocket.biz/try";

const tokenRefresh = () => {
  chrome.windows.create({
    url: AUTH_URL,
    width: 530,
    height: 700,
    type: "popup",
  });
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
