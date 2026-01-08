import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

const hideLoading = () => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.remove();
    }, 600);
  }
};

try {
  if (!rootElement) {
    throw new Error("找不到根節點 #root");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // 嘗試在渲染開始後不久隱藏 Loading
  setTimeout(hideLoading, 300);
} catch (e) {
  console.error("渲染過程發生錯誤:", e);
  hideLoading();
}

// 監聽資源載入完成作為最終備案
window.addEventListener('load', hideLoading);

// 額外保險：如果模組已執行但 5 秒後還在 loading，強制嘗試隱藏
setTimeout(hideLoading, 5000);