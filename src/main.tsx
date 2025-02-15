
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure MyLife is initialized before mounting the app
const initApp = () => {
  if (!window.MyLife?.WebApp) {
    console.error('MyLife WebApp is not initialized, retrying...');
    setTimeout(initApp, 100); // Retry after 100ms
    return;
  }
  
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
