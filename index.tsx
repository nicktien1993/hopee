import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 1. 立即移除 HTML 中的載入動畫，避免被卡死
const hideLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  }
};

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    // 渲染前隱藏
    hideLoader();
    root.render(<App />);
  } catch (err) {
    console.error("React Mounting Error:", err);
    // 如果報錯，至少把轉圈關掉讓用戶看到什麼發生了
    hideLoader();
    rootElement.innerHTML = `<div style="padding:20px; color:red;">React 啟動失敗：${err}</div>`;
  }
}