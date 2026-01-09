import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const startApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 在 React 渲染排程完成後隱藏遮罩
    requestAnimationFrame(() => {
      setTimeout(() => {
        if ((window as any).hideLoadingOverlay) {
          (window as any).hideLoadingOverlay();
        }
      }, 300);
    });
  } catch (err) {
    console.error("React Mounting Error:", err);
    // 如果發生渲染錯誤，錯誤監聽器會處理 UI
  }
};

startApp();