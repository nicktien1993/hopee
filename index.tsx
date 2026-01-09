import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  
  // 確保在 React 開始渲染時就嘗試與外部溝通
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // 渲染完成後的回調
  requestAnimationFrame(() => {
    if (typeof (window as any).hideLoadingOverlay === 'function') {
      (window as any).hideLoadingOverlay();
    }
  });
}