export const getToken = () => {

  const senddata =
  {
    "app": "femihkgadmhfmdlkjjfjcgleppfggadk"
  };

  return fetch("https://client.retrorocket.biz/token", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(senddata)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("failed to get request token");
      }
      return response.json();
    })
    .then(data => {
      if (data.access_token) {
        chrome.storage.local.set({ "accessToken": data.access_token }, () => {
          alert("アクセストークンを取得しました。ウィンドウを閉じます。\n\nオプションページからトークンを取得した場合：\nウィンドウを閉じたあと、オプションページをリロードしてください。\n\nイベント設定ウィンドウに登録対象のカレンダーが表示されていない場合：\nウィンドウを閉じたあと、イベント設定ウィンドウ内の「再取得」ボタンをクリックしてください。クリック後予定が登録できるようになります。");
          window.close();
        });
      } else {
        throw new Error("failed to get request token");
      }
    })
    .catch(() => {
      alert("アクセストークンを取得できませんでした。このウィンドウを閉じてオプションページから再度登録を行ってください。");
      window.close();
    });
}

getToken();
