export const getToken = () => {
  const senddata = {
    app: "femihkgadmhfmdlkjjfjcgleppfggadk",
  };

  return fetch("https://client.retrorocket.biz/token", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(senddata),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("failed to get request token");
      }
      return response.json();
    })
    .then((data) => {
      if (data.access_token) {
        chrome.storage.local.set({ accessToken: data.access_token });
      } else {
        throw new Error("failed to get request token");
      }
    })
    .catch(() => {
      alert(
        "アクセストークンを取得できませんでした。このウィンドウを閉じてオプションページから再度登録を行ってください。"
      );
    })
    .finally(() => {
      chrome.windows.getCurrent((window) => {
        chrome.windows.remove(window.id);
      });
    });
};

getToken();
