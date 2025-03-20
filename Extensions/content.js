// content.js - Runs on LeetCode problem pages
(async function () {
    // Function to extract problem description
    function getProblemDescription() {
        const problemDiv = document.querySelector("div.elfjS[data-track-load='description_content']");
        return problemDiv ? problemDiv.innerText.trim() : null;
    }
    
    // Fetch problem description and send to backend
    async function sendProblemDescription() {
        const description = getProblemDescription();
        if (description) {
            const processedData = await firecrawl.process(description); // Firecrawl cleaning
            fetch('http://your-backend.com/scrape-problem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: processedData })
            });
        }
    }
    
    // Extract user code from Monaco Editor
    function getEditorContent() {
        const editor = monaco.editor.getModels()[0];
        return editor ? editor.getValue() : null;
    }
    
    // Send editor content to backend
    async function sendEditorContent() {
        const code = getEditorContent();
        if (code) {
            fetch('http://your-backend.com/editor-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
        }
    }
    
    // Function to show snackbar notification
    function showSnackbar(message) {
        const snackbar = document.createElement('div');
        snackbar.className = 'snackbar';
        snackbar.innerText = message;
        document.body.appendChild(snackbar);
        setTimeout(() => snackbar.remove(), 3000);
    }
    
    // Fetch response flag and show a snackbar
    async function flagResponse() {
        const responses = {
            right: ["You're headed in the right way", "Hmmm, that might work"],
            wrong: ["Not quite there yet", "Try another way"],
            off: ["Nah that won't work"]
        };
        
        const keys = Object.keys(responses);
        const category = keys[Math.floor(Math.random() * keys.length)];
        const message = responses[category][Math.floor(Math.random() * responses[category].length)];
        
        showSnackbar(message);
    }
    
    // Inject UI Buttons in Extension Popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "fetch-intuition") {
            fetch('http://your-backend.com/show-intuition')
                .then(res => res.text())
                .then(data => alert(`Intuition: ${data}`));
        } else if (request.action === "fetch-solution") {
            fetch('http://your-backend.com/show-solution')
                .then(res => res.text())
                .then(data => alert(`Solution: ${data}`));
        }
    });
    
    // Send data when page loads
    setTimeout(() => {
        sendProblemDescription();
        sendEditorContent();
    }, 3000);

    // Add popup buttons for UI
    const extensionUI = document.createElement('div');
    extensionUI.className = 'leetcode-extension-ui';
    extensionUI.innerHTML = `
        <button id='show-intuition'>Show Intuition</button>
        <button id='show-solution'>Show Solution</button>
    `;
    document.body.appendChild(extensionUI);
    
    document.getElementById('show-intuition').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "fetch-intuition" });
    });
    
    document.getElementById('show-solution').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "fetch-solution" });
    });
})();