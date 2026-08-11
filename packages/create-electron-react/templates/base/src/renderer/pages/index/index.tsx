import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function App() {
  return (
    <main className="app">
      <p className="eyebrow">Electron React Starter</p>
      <h1>Electron + React + TypeScript</h1>
      <p>
        Chromium {window.electron.versions.chrome} · Electron{' '}
        {window.electron.versions.electron}
      </p>
    </main>
  );
}

const root = document.querySelector<HTMLDivElement>('#root');

if (!root) {
  throw new Error('Root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
