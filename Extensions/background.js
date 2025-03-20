chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received:", message);

    if (message.action === "sendCode") {
        console.log("Received LeetCode Code:", message.code);
        chrome.storage.local.set({ leetCodeCode: message.code });
    }
});
