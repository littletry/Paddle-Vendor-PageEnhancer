document.addEventListener('DOMContentLoaded', function() {
  const toggleHide = document.getElementById('toggleHide');
  const openOptions = document.getElementById('openOptions');

  // 加载当前状态
  chrome.storage.sync.get({
    isHidden: true // 默认为隐藏
  }, function(items) {
    toggleHide.checked = items.isHidden;
  });

  // 监听开关变化
  toggleHide.addEventListener('change', function() {
    chrome.storage.sync.set({
      isHidden: toggleHide.checked
    }, function() {
      // 通知当前标签页更新状态
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleHide',
            isHidden: toggleHide.checked
          });
        }
      });
    });
  });
  
  // 打开选项页面
  openOptions.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}); 