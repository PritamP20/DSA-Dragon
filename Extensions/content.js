const fetchLeetcodeData = async () => {
    const descriptionDiv = document.querySelector("div.elfjS[data-track-load='description_content']");
    if (descriptionDiv) {
        const problemDescription = descriptionDiv.innerText;
        console.log("Fetched Problem Description:", problemDescription);
        await fetch("https://your-rag-app.com/api/knowledge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: problemDescription })
        });
    }
};

const sendCodeChunks = () => {
    const editor = monaco.editor.getModels()[0];
    if (editor) {
        const code = editor.getValue();
        const lines = code.split('\n');
        
        for (let i = 0; i < lines.length; i += 2) {
            const chunk = lines.slice(i, i + 2).join('\n');
            fetch("https://your-rag-app.com/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: chunk })
            })
            .then(response => response.json())
            .then(data => console.log("Response:", data))
            .catch(error => console.error("Error:", error));
        }
    }
};

const observer = new MutationObserver(sendCodeChunks);
const editorContainer = document.querySelector(".monaco-editor");
if (editorContainer) {
    observer.observe(editorContainer, { childList: true, subtree: true, characterData: true });
}

document.addEventListener("DOMContentLoaded", fetchLeetcodeData);