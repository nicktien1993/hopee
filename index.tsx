import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const report = (msg: string, isError = false) => {
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
    
    // 渲染完成後隱藏載入遮罩
    setTimeout(() => {
      if ((window as any).hideLoadingOverlay) {
        (window as any).hideLoadingOverlay();
      }
    }, 800);
  } catch (err: any) {
    report(`渲染異常: ${err.message}`, true);
  }
} else {
  report("找不到根節點 #root", true);
}
