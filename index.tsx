import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const report = (msg: string, isError = false) => {
  if ((window as any).logStatus) {
    (window as any).logStatus(msg, isError);
  }
  console.log(`[React-App] ${msg}`);
};

report("🚀 index.tsx 腳本已啟動執行...");

const container = document.getElementById('root');

if (container) {
  try {
    report("📦 正在初始化 React 19 渲染根節點...");
    const root = ReactDOM.createRoot(container);
    
    report("🎨 開始渲染應用程式組件...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    report("✅ 渲染指令已成功發出");
    
    // 延遲隱藏遮罩以確保初次渲染平滑
    setTimeout(() => {
      if ((window as any).hideLoadingOverlay) {
        (window as any).hideLoadingOverlay();
        report("✨ 載入完成，隱藏遮罩");
      }
    }, 500);
  } catch (err: any) {
    report(`React 渲染過程中發生異常: ${err.message}`, true);
  }
} else {
  report("致命錯誤：找不到 HTML 中的 #root 節點，請檢查 index.html 結構。", true);
}
