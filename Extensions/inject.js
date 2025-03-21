// inject.js
(function() {
    function captureCode() {
      try {
        // Get the Monaco editor instance
        const editor = monaco.editor.getModels()[0];
        if (editor) {
          // Get the code from the editor
          const code = editor.getValue();
          
          // Send the code to the content script
          window.postMessage({
            type: "FROM_PAGE",
            action: "codeCaptured",
            code: code
          }, "*");
          
          console.log("LeetCode code captured");
          return code;
        } else {
          console.log("Monaco editor not found");
          return null;
        }
      } catch (error) {
        console.error("Error capturing code:", error);
        return null;
      }
    }
    
    // Check for the editor every second until found
    const checkInterval = setInterval(() => {
      if (typeof monaco !== 'undefined' && monaco.editor && monaco.editor.getModels().length > 0) {
        captureCode();
        clearInterval(checkInterval);
        
        // Set up a mutation observer to detect when code might have changed
        const observer = new MutationObserver(() => {
          captureCode();
        });
        
        // Target the editor container or parent element that contains the editor
        const editorContainer = document.querySelector('.monaco-editor');
        if (editorContainer) {
          observer.observe(editorContainer, { 
            childList: true, 
            subtree: true,
            characterData: true 
          });
        }
      }
    }, 1000);
    
    // Also capture code when manually triggered
    window.addEventListener("message", (event) => {
      if (event.data.type === "FROM_EXTENSION" && event.data.action === "getCode") {
        captureCode();
      }
    });
  })();