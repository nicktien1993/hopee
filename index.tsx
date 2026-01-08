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
      if (overlay.parentNode) overlay.remove();
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
  
  // 載入成功後立即嘗試隱藏
  hideLoading();
} catch (e) {
  console.error("渲染過程發生錯誤:", e);
  hideLoading(); // 出錯也要把遮罩關掉，讓全域錯誤顯示出來
}

// 監聽資源載入完成作為備案
window.addEventListener('load', () => {
  setTimeout(hideLoading, 500);
});