// 全局变量
let observer;
let observerTimeout;
const OBSERVER_TIMEOUT = 10000; // 10秒后停止观察

function initializeObserver() {
    // 如果已存在观察者，先断开连接
    if (observer) {
        observer.disconnect();
    }
    
    // 清除之前的超时
    if (observerTimeout) {
        clearTimeout(observerTimeout);
    }

    // 设置超时，如果在指定时间内没有找到元素，停止观察
    observerTimeout = setTimeout(() => {
        if (observer) {
            observer.disconnect();
            console.log('Paddle Enhancer: 观察超时，未找到目标元素');
        }
    }, OBSERVER_TIMEOUT);

    observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                const balanceElement = document.getElementById('balance-amount');
                if (balanceElement) {
                    observer.disconnect(); // 找到元素后停止观察
                    clearTimeout(observerTimeout); // 清除超时
                    balanceElement.classList.add('hidden'); // 先隐藏元素
                    applyMask();
                    break;
                }
            }
        }
    });

    // 尝试找到一个更具体的父元素来观察，而不是整个文档
    const headerElement = document.querySelector('header') || document.querySelector('.header') || document.querySelector('#header');
    
    // 如果找到了更具体的父元素，就观察它，否则观察整个文档
    const targetNode = headerElement || document.documentElement || document.body;
    
    // 开始观察 DOM 变化
    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });
    
    // 立即检查元素是否已经存在
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        observer.disconnect();
        clearTimeout(observerTimeout);
        balanceElement.classList.add('hidden');
        applyMask();
    }
}

// 初始化观察者
initializeObserver();

// 监听 URL 变化
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        initializeObserver();
    }
}).observe(document, { subtree: true, childList: true });

// 监听存储变化，实时更新样式
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && (changes.maskOpacity || changes.isHidden)) {
        applyMask();
    }
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleHide') {
        applyMask();
    }
});

// 应用遮罩
function applyMask() {
    // 从存储中获取设置
    chrome.storage.sync.get({
        maskOpacity: 100, // 默认完全不透明
        maskColor: '#808080', // 默认灰色
        isHidden: true // 默认隐藏
    }, function(items) {
        // 查找余额元素
        const balanceElement = document.getElementById('balance-amount');
        if (balanceElement) {
            if (items.isHidden) {
                // 添加隐藏类
                balanceElement.classList.add('hidden');
                
                // 设置遮罩样式
                const opacity = items.maskOpacity / 100;
                
                // 将十六进制颜色转换为RGBA
                const rgbaColor = hexToRgba(items.maskColor, opacity);
                
                // 使用 !important 来确保样式生效
                balanceElement.style.setProperty('color', 'transparent', 'important');
                balanceElement.style.setProperty('background-color', rgbaColor, 'important');
                balanceElement.style.setProperty('padding', '2px 4px', 'important');
                balanceElement.style.setProperty('border-radius', '3px', 'important');
                
                // 显示元素（带遮罩）
                setTimeout(() => {
                    balanceElement.classList.remove('hidden');
                }, 50);
            } else {
                // 移除隐藏类
                balanceElement.classList.remove('hidden');
                
                // 移除所有遮罩样式
                balanceElement.style.removeProperty('color');
                balanceElement.style.removeProperty('background-color');
                balanceElement.style.removeProperty('padding');
                balanceElement.style.removeProperty('border-radius');
            }
        }
    });
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