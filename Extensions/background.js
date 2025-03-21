// background.js
// Store the extracted code
let extractedCode = "";

// Log the installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("LeetCode Code Extractor installed");
});

// Function to execute script that directly accesses monaco
function executeMonacoExtraction(tabId) {
  if (tabId < 0) return;
  
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function() {
      console.log("Attempting direct monaco access");
      
      try {
        // Check if monaco is defined
        if (typeof monaco !== 'undefined' && monaco.editor) {
          console.log("Monaco editor found");
          
          // Get all editor models
          const models = monaco.editor.getModels();
          console.log(`Found ${models.length} monaco editor models`);
          
          if (models.length > 0) {
            // Get the value from the first model
            const code = models[0].getValue();
            console.log("Extracted code from monaco model");
            
            // Send the code back via a custom event
            document.dispatchEvent(new CustomEvent('monaco-code-extracted', {
              detail: { code: code }
            }));
            
            // Also output to console for debugging
            console.log("Code:", code);
            
            return true;
          }
        } else {
          console.log("Monaco editor not found or not initialized yet");
        }
      } catch (error) {
        console.error("Error extracting code from monaco:", error);
      }
      
      return false;
    }
  });
}

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle content script loaded message
  if (message.action === "contentScriptLoaded" && sender.tab) {
    console.log("Content script loaded in tab:", sender.tab.id);
  }
  
  // Handle code captured message
  if (message.action === "codeCaptured") {
    extractedCode = message.code;
    console.log("Code captured in background script");
    return true;
  }
  
  // Handle get code message (from popup)
  if (message.action === "getCode") {
    console.log("Code requested by popup");
    sendResponse({ code: extractedCode });
    return true;
  }
  
  // Handle execute monaco extraction
  if (message.action === "executeMonacoExtraction") {
    const tabId = sender.tab ? sender.tab.id : -1;
    executeMonacoExtraction(tabId);
    return true;
  }
});

// Also listen for tab updates to reinject script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes("leetcode.com")) {
    // Wait a bit for the page to fully load
    setTimeout(() => {
      executeMonacoExtraction(tabId);
    }, 3000);
  }
});