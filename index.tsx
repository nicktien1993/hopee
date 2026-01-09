import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 主動嘗試移除載入遮罩
try {
  if ((window as any).hideLoadingOverlay) {
    (window as any).hideLoadingOverlay();
  }
} catch (e) {
  console.error(e);
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}