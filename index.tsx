import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
    
    // 渲染排程完成後隱藏遮罩
    setTimeout(() => {
      if ((window as any).hideLoadingOverlay) {
        (window as any).hideLoadingOverlay();
      }
    }, 500);
  } catch (err) {
    console.error("Mounting Error:", err);
  }
}