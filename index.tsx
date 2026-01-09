import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const log = (msg: string, isError = false) => {
  if ((window as any).logStatus) {
    (window as any).logStatus(msg, isError);
  }
  console.log(`[React-Init] ${msg}`);
};

log("🚀 index.tsx 開始執行...");

const container = document.getElementById('root');

if (!container) {
  log("❌ 找不到根節點 #root", true);
} else {
  try {
    log("📦 初始化 React Root 並開始渲染...");
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
    
    log("✅ 渲染指令已送出");
    
    // 監聽 React 渲染完成的保險機制
    setTimeout(() => {
      if ((window as any).hideLoadingOverlay) {
        (window as any).hideLoadingOverlay();
      }
    }, 800);
  } catch (err: any) {
    log(`❌ React 初始化失敗: ${err.message}`, true);
  }
}

// 萬用的資源載入保險
window.addEventListener('load', () => {
  log("📦 視窗資源全數載入完成");
});
