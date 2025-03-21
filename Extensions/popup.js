// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const extractButton = document.getElementById('extract-button');
    const codeOutput = document.getElementById('code-output');
    const copyButton = document.getElementById('copy-button');
    const clearButton = document.getElementById('clear-button');
    const statusElement = document.getElementById('status');
    
    // Function to show status message
    function showStatus(message, isError = false) {
      statusElement.textContent = message;
      statusElement.style.color = isError ? 'red' : 'green';
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
    }
    
    // Function to get code from active tab
    function extractCodeFromActiveTab() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        
        if (!activeTab.url.includes('leetcode.com')) {
          showStatus('This extension only works on LeetCode', true);
          return;
        }
        
        // First try to get code from background script (if already captured)
        chrome.runtime.sendMessage({ action: 'getCode' }, function(response) {
          if (response && response.code) {
            codeOutput.value = response.code;
            showStatus('Code extracted successfully!');
          } else {
            // If no code in storage, request fresh extraction
            chrome.tabs.sendMessage(activeTab.id, { action: 'extractCode' }, function(response) {
              if (chrome.runtime.lastError) {
                showStatus('Error: Make sure you\'re on a LeetCode problem page', true);
              } else {
                showStatus('Extracting code... Please wait a moment and try again.');
              }
            });
          }
        });
      });
    }
    
    // Extract code when button is clicked
    extractButton.addEventListener('click', extractCodeFromActiveTab);
    
    // Extract code when popup opens
    extractCodeFromActiveTab();
    
    // Copy code to clipboard
    copyButton.addEventListener('click', function() {
      if (codeOutput.value) {
        navigator.clipboard.writeText(codeOutput.value)
          .then(() => {
            showStatus('Code copied to clipboard!');
          })
          .catch(err => {
            showStatus('Failed to copy code: ' + err, true);
          });
      } else {
        showStatus('No code to copy', true);
      }
    });
    
    // Clear the code output
    clearButton.addEventListener('click', function() {
      codeOutput.value = '';
      showStatus('Cleared!');
    });
  });