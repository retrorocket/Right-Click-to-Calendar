"use strict";

const tokenRefresh = () => {

  const params = {
    "refreshtoken": localStorage["refreshToken"]
  };

  return fetch("https://rcapi.retrorocket.biz/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(params).toString()
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("failed token refresh");
      }
      return response.json();
    })
    .then(data => {
      localStorage["accessToken"] = data.access_token;
    });
}

export const checkToken = (accessToken) => {
  return fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("invalid token");
      }
      return response.json();
    })
    .catch(() => {
      return tokenRefresh();
    });
}
