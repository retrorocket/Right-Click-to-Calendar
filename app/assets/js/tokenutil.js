"use strict";

const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const state = Array.from(crypto.getRandomValues(new Uint8Array(12))).map((n) => S[n % S.length]).join('');

const REDIRECT_URL = "https://rcapi.retrorocket.biz/oauth2";
const CLIENT_ID = "94384066361-kgpm35l8cdcn4kqrd09tob7sssulnj1c.apps.googleusercontent.com"
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"];

// See: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
// Googleのドキュメントではimplicit flowを使っているが、OAuth 2.0でimplicit flowは非推奨
// Chromiumサポートはベータ機能のため、現時点ではtokeninfoでaudienceを確認することで最低限リスクを回避するにとどめている
// Chromiumをサポートし続ける場合は修正が必要
const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URL
)}&scope=${encodeURIComponent(SCOPES.join(" "))}&state=${state}`;

const tokenRefresh = () => {
  chrome.storage.local.set({ "state": state }, () => {
    chrome.windows.create({
      "url": AUTH_URL,
      "width": 530,
      "height": 700,
      "type": "popup"
    });
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
      tokenRefresh();
      throw new Error("need token refresh");
    });
}
