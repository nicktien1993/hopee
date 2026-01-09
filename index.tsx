import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
    
    // 渲染的第一時間就通知隱藏遮罩
    if ((window as any).hideLoadingOverlay) {
      (window as any).hideLoadingOverlay();
    }
  } catch (err) {
    console.error("Mount Error:", err);
  }
}