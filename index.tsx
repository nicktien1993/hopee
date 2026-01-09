import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 index.tsx 已啟動執行");

const rootElement = document.getElementById('root');

const hideLoading = () => {
  if (typeof (window as any).hideLoadingOverlay === 'function') {
    (window as any).hideLoadingOverlay();
  }
};

try {
  if (!rootElement) {
    throw new Error("找不到 HTML 中的 #root 節點。");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log("✅ React Render 請求已送出");
  // 延遲隱藏 Loading，確保 React 有時間處理初次渲染
  setTimeout(hideLoading, 800);
} catch (e: any) {
  console.error("致命錯誤: React 渲染崩潰 -", e.message);
  hideLoading();
}

// 備援：全頁載入完成後隱藏
window.addEventListener('load', () => {
  console.log("📦 視窗資源全數載入完成");
  hideLoading();
});