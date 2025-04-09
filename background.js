chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'textSelected') {
    const selectedText = request.text;
    const prompt = request.prompt;
    console.log('Received selected text:', selectedText);

    // 在这里处理选中的文本
    // 例如，存储到本地存储：
    chrome.storage.session.set({ selectedText, prompt }, function () {
      console.log('Selected text saved to storage.');
    });
  }
});
