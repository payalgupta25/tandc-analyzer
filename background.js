chrome.runtime.onInstalled.addListener(() => {
    console.log("T&C Analyzer installed.");
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzePage") {
      chrome.tabs.sendMessage(sender.tab.id, { action: "analyzePage" }, sendResponse);
      return true; // keep message channel open for async response
    }
  });
  