// content.js
console.log("📄 content.js loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageText") {
    // grab every bit of visible text on the page
    const visibleText = document.body.innerText;
    sendResponse({ text: visibleText });
  }
});
