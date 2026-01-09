import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 當這個檔案開始執行，表示 ESM 載入成功
document.body.classList.add('js-loaded');
const loader = document.getElementById('initial-loader');
if (loader) loader.style.display = 'none';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}