import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const log = (msg: string, isError = false) => {
  if ((window as any).logStatus) {
    (window as any).logStatus(msg, isError);
  }
};

const container = document.getElementById('root');

if (container) {
  try {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 渲染任務發出後，短暫延遲以確保初次佈局完成
    setTimeout(() => {
      if ((window as any).hideLoadingOverlay) {
        (window as any).hideLoadingOverlay();
      }
    }, 800);
  } catch (err: any) {
    log(`React 渲染異常: ${err.message}`, true);
  }
} else {
  log("找不到 HTML 根節點 #root", true);
}
