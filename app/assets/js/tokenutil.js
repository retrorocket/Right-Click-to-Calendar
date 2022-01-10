"use strict";

const REDIRECT_URL = chrome.identity.getRedirectURL("/oauth2");
const CLIENT_ID = "94384066361-kgpm35l8cdcn4kqrd09tob7sssulnj1c.apps.googleusercontent.com"
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"];
const AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URL
)}&scope=${encodeURIComponent(SCOPES.join(" "))}`;

const tokenRefresh = () => {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({
      url: AUTH_URL,
      interactive: true
    }, responseUrl => {
      if (chrome.runtime.lastError) {
        localStorage.removeItem("accessToken");
        reject(new Error("error"))
      } else {
        const url = new URL(responseUrl);
        // searchParams を使いたいので適当なURLにくっつける
        const urlsearch = new URL("http://example.com?" + url.hash.slice(1));
        const accessToken = urlsearch.searchParams.get("access_token");
        localStorage["accessToken"] = accessToken;
        resolve(accessToken);
      }
    })
  })
}

export const checkToken = (accessToken) => {
  return fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("invalid token");
      }
      return response.json();
    })
    .then(data => {
      if (data.aud && data.aud === CLIENT_ID) {
        return data;
      } else {
        throw new Error("invalid token");
      }
    })
    .catch(() => {
      return tokenRefresh();
    });
}
