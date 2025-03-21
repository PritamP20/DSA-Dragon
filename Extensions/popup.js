document.getElementById("fetch-intuition").addEventListener("click", () => {
    console.log("Show Intuition button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("Sending fetch-intuition message to content script");
        chrome.tabs.sendMessage(tabs[0].id, { action: "fetch-intuition" });
    });
});

document.getElementById("fetch-solution").addEventListener("click", () => {
    console.log("Show Solution button clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("Sending fetch-solution message to content script");
        chrome.tabs.sendMessage(tabs[0].id, { action: "fetch-solution" });
    });
});
