chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Privacy Analyzer Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzePage") {
    chrome.tabs.sendMessage(sender.tab.id, { action: "analyzePage" }, sendResponse);
    return true; // keep message channel open
  }
});
