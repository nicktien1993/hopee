import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 定義一個全域輔助函式來回報狀態給 HTML 的診斷區
const logToHtml = (msg: string, isError = false) => {
  if ((window as any).logStatus) {
    (window as any).logStatus(msg, isError);
  } else {
    console.log(msg);
  }
};

logToHtml("🚀 index.tsx 已啟動執行...");

const rootElement = document.getElementById('root');

const finishLoading = () => {
  if (typeof (window as any).hideLoadingOverlay === 'function') {
    (window as any).hideLoadingOverlay();
  }
};

if (!rootElement) {
  logToHtml("❌ 找不到 #root 節點", true);
} else {
  try {
    logToHtml("📦 正在嘗試初始化 React Root...");
    const root = ReactDOM.createRoot(rootElement);
    
    logToHtml("🎨 執行 Render...");
    root.render(<App />);
    
    logToHtml("✅ React 掛載流程已完成");
    // 成功後隱藏
    setTimeout(finishLoading, 600);
  } catch (err: any) {
    logToHtml(`❌ 渲染過程中發生錯誤: ${err.message}`, true);
    finishLoading();
  }
}

// 保險：如果 5 秒後還沒隱藏，強制隱藏
setTimeout(finishLoading, 5000);