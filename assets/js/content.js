chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        let selectedText = document.getSelection().toString();
        if (!selectedText) {
            let frames = window.parent.frames; // 親に付随する子フレームをすべて取得する
            for (let i = 0; i < frames.length; i++) {
                selectedText = frames[i].document.getSelection().toString();
                if (selectedText) {
                    break;
                }
            }
        }
        sendResponse({
            stext: selectedText,
        });
        return true;
    }
);