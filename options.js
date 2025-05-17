// 获取页面元素
const maskOpacityInput = document.getElementById('maskOpacity');
const maskOpacityValue = document.getElementById('maskOpacityValue');
const maskPreview = document.getElementById('maskPreview');
const maskColorInput = document.getElementById('maskColor');
const maskColorValue = document.getElementById('maskColorValue');
const saveButton = document.getElementById('save');
const resetButton = document.getElementById('reset');
const statusElement = document.getElementById('status');

// 默认设置
const DEFAULT_SETTINGS = {
  maskOpacity: 100,
  maskColor: '#808080'
};

// 加载保存的设置
function loadOptions() {
  chrome.storage.sync.get({
    maskOpacity: DEFAULT_SETTINGS.maskOpacity, // 默认完全不透明
    maskColor: DEFAULT_SETTINGS.maskColor // 默认灰色
  }, function(items) {
    maskOpacityInput.value = items.maskOpacity;
    maskOpacityValue.textContent = `${items.maskOpacity}%`;
    
    maskColorInput.value = items.maskColor;
    maskColorValue.textContent = items.maskColor;
    
    updateMaskPreview(items.maskOpacity, items.maskColor);
  });
}

// 保存设置
function saveOptions() {
  const maskOpacity = parseInt(maskOpacityInput.value);
  const maskColor = maskColorInput.value;
  
  chrome.storage.sync.set({
    maskOpacity: maskOpacity,
    maskColor: maskColor
  }, function() {
    // 显示保存成功消息
    showStatus('设置已保存！');
  });
}

// 重置为默认设置
function resetOptions() {
  maskOpacityInput.value = DEFAULT_SETTINGS.maskOpacity;
  maskOpacityValue.textContent = `${DEFAULT_SETTINGS.maskOpacity}%`;
  
  maskColorInput.value = DEFAULT_SETTINGS.maskColor;
  maskColorValue.textContent = DEFAULT_SETTINGS.maskColor;
  
  updateMaskPreview(DEFAULT_SETTINGS.maskOpacity, DEFAULT_SETTINGS.maskColor);
  
  // 保存默认设置
  chrome.storage.sync.set(DEFAULT_SETTINGS, function() {
    showStatus('已重置为默认设置！');
  });
}

// 显示状态消息
function showStatus(message) {
  statusElement.textContent = message;
  statusElement.className = 'status success';
  statusElement.style.display = 'block';
  
  // 添加淡出动画
  setTimeout(function() {
    statusElement.style.opacity = '0';
    statusElement.style.transition = 'opacity 0.5s ease';
    
    // 完全隐藏元素
    setTimeout(function() {
      statusElement.style.display = 'none';
      statusElement.style.opacity = '1';
      statusElement.style.transition = '';
    }, 500);
  }, 2000);
}

// 实时更新显示的值
function updateOpacityValue() {
  maskOpacityValue.textContent = `${maskOpacityInput.value}%`;
  updateMaskPreview(maskOpacityInput.value, maskColorInput.value);
}

// 实时更新颜色值
function updateColorValue() {
  maskColorValue.textContent = maskColorInput.value;
  updateMaskPreview(maskOpacityInput.value, maskColorInput.value);
}

// 更新遮罩预览
function updateMaskPreview(opacity, color) {
  const opacityValue = opacity / 100;
  const rgbaColor = hexToRgba(color, opacityValue);
  maskPreview.style.backgroundColor = rgbaColor;
}

// 将十六进制颜色转换为RGBA
function hexToRgba(hex, alpha) {
  // 移除可能的 # 前缀
  hex = hex.replace('#', '');
  
  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 返回RGBA格式
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', loadOptions);
saveButton.addEventListener('click', saveOptions);
resetButton.addEventListener('click', resetOptions);
maskOpacityInput.addEventListener('input', updateOpacityValue);
maskColorInput.addEventListener('input', updateColorValue); 