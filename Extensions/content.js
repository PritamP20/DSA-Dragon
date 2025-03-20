function waitForMonacoAndExtract() {
    let attempts = 0;
    const interval = setInterval(() => {
        let editor = monaco.editor.getModels()[0];
        if (editor) {
            clearInterval(interval);
            let code = editor.getValue();
            console.log("Extracted after delay:", code);
            window.postMessage({ type: "LEETCODE_CODE", code: code }, "*");
        } else if (attempts > 10) { // Stop after 10 attempts (~5s)
            clearInterval(interval);
            console.warn("Monaco Editor did not load.");
        }
        attempts++;
    }, 500); // Check every 500ms
}

waitForMonacoAndExtract();
