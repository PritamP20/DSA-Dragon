document.addEventListener("DOMContentLoaded", function () {
    const codeContainer = document.getElementById("codeContainer");

    chrome.storage.local.get("leetCodeCode", (data) => {
        console.log("Popup retrieved:", data);
        if (data.leetCodeCode) {
            codeContainer.innerText = data.leetCodeCode;
        } else {
            codeContainer.innerText = "No code found!";
            console.warn("No code stored in chrome.storage.local");
        }
    });
});
