console.log("Content script loaded.");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageText") {
      const visibleText = document.body.innerText;
      sendResponse({ text: visibleText });
    }
  });
  