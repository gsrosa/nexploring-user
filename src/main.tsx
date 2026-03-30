import { AtlasProvider } from '@gsrosa/atlas-ui';
import '@gsrosa/atlas-ui/styles';
import '@/styles/standalone.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AtlasProvider defaultMode="dark">
        <App />
      </AtlasProvider>
    </StrictMode>,
  );
}
