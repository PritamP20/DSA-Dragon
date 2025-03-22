// content.js
console.log("LeetCode Code Extractor content script loaded");

// Function to directly find and extract code from the DOM
function extractCodeFromDOM() {
  try {
    // Try different selector approaches
    
    // 1. Try finding the Monaco editor container
    const editorDiv = document.querySelector('.monaco-editor');
    if (editorDiv) {
      console.log("Found Monaco editor container");
    }
    
    // 2. Look for the textarea or pre elements that might contain code
    const codeElements = document.querySelectorAll('.monaco-editor .view-lines .view-line');
    if (codeElements && codeElements.length > 0) {
      console.log(`Found ${codeElements.length} code line elements`);
      
      // Extract text from the lines
      const codeLines = [];
      codeElements.forEach(elem => {
        codeLines.push(elem.textContent || "");
      });
      const extractedCode = codeLines.join('\n');
      
      if (extractedCode) {
        console.log("Extracted code from DOM:", extractedCode);
        
        // Send the extracted code to the background script
        chrome.runtime.sendMessage({
          action: "codeCaptured",
          code: extractedCode
        });
        
        return extractedCode;
      }
    }
    
    // 3. Look for code in the "Playground" area
    const playgroundCode = document.querySelector('.playground-code');
    if (playgroundCode) {
      const code = playgroundCode.textContent;
      if (code) {
        console.log("Found code in playground area");
        chrome.runtime.sendMessage({
          action: "codeCaptured",
          code: code
        });
        
        return code;
      }
    }
    
    // 4. Try finding elements with specific class names related to code
    const codeAreas = Array.from(document.querySelectorAll('pre, code, .CodeMirror-code, .monaco-scrollable-element'));
    for (const codeArea of codeAreas) {
      if (codeArea.textContent && codeArea.textContent.includes('class') || codeArea.textContent.includes('function')) {
        const code = codeArea.textContent;
        console.log("Found code-like content in element:", codeArea);
        
        chrome.runtime.sendMessage({
          action: "codeCaptured",
          code: code
        });
        
        return code;
      }
    }
    
    console.log("No code elements found in the DOM");
    return null;
  } catch (error) {
    console.error("Error extracting code from DOM:", error);
    return null;
  }
}

// Use MutationObserver to detect when editor content might have changed
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // The DOM has changed, try to extract code
        extractCodeFromDOM();
      }
    }
  });

  // Start observing the entire document
  observer.observe(document.body, { 
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log("Set up mutation observer to track code changes");
}

// Function to try accessing window.monaco through executeScript
function tryMonacoExtraction() {
  chrome.runtime.sendMessage({
    action: "executeMonacoExtraction",
    tabId: -1 // Will be updated in background script
  });
}

// Extract code periodically
function startPeriodicExtraction() {
  // Try immediately
  setTimeout(extractCodeFromDOM, 2000);
  setTimeout(tryMonacoExtraction, 3000);
  
  // Then periodically
  setInterval(extractCodeFromDOM, 5000);
  setInterval(tryMonacoExtraction, 7000);
  
  console.log("Set up periodic code extraction");
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractCode") {
    console.log("Extract code request received from popup");
    
    // Try both methods
    const domCode = extractCodeFromDOM();
    tryMonacoExtraction();
    
    sendResponse({ success: true, domCode: domCode ? true : false });
    return true;
  }
});

// Initialize
setupMutationObserver();
startPeriodicExtraction();

// Let background script know we're ready
chrome.runtime.sendMessage({
  action: "contentScriptLoaded",
  url: window.location.href
});

console.log("LeetCode Code Extractor fully initialized");


// Add this to the end of your content.js file
// Listen for the event from page context
document.addEventListener('monaco-code-extracted', (event) => {
    if (event.detail && event.detail.code) {
      console.log("Received code from monaco in content script");
      
      // Send to background script
      chrome.runtime.sendMessage({
        action: "codeCaptured",
        code: event.detail.code
      });
    }
  });