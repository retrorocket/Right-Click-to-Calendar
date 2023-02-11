"use strict";

const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const state = Array.from(crypto.getRandomValues(new Uint8Array(12))).map((n) => S[n % S.length]).join('');

const REDIRECT_URL = chrome.identity.getRedirectURL("/oauth2");
const CLIENT_ID = "94384066361-kgpm35l8cdcn4kqrd09tob7sssulnj1c.apps.googleusercontent.com"
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"];
const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URL
)}&scope=${encodeURIComponent(SCOPES.join(" "))}&state=${state}`;

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
        const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));
        if (params.get("state") !== state) {
          reject(new Error("error"))
        }
        const accessToken = params.get("access_token");
        localStorage["accessToken"] = accessToken;
        resolve(accessToken);
      }
    })
  })
}

export const checkToken = (accessToken) => {
  return fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`)
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
