import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // 渲染後自動隱藏加載器
    const loader = document.getElementById('initial-loader');
    if (loader) {
      // 延遲一點點確保內容已渲染
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }
  } catch (err) {
    console.error("React Render Error:", err);
    const errBox = document.getElementById('error-box');
    const errMsg = document.getElementById('error-msg');
    if (errBox && errMsg) {
      errBox.style.display = 'block';
      errMsg.innerText = "渲染失敗: " + err.message;
    }
  }
}