import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

// 呼叫 HTML 定義的全域函式
const hideLoading = () => {
  if (typeof (window as any).hideLoadingOverlay === 'function') {
    (window as any).hideLoadingOverlay();
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
  
  // 渲染完成後通知隱藏
  setTimeout(hideLoading, 500);
} catch (e) {
  console.error("渲染過程發生錯誤:", e);
  hideLoading();
}

// 監聽資源載入完成作為備案
window.addEventListener('load', hideLoading);