import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { AppProvider } from './app/AppProvider';
import { ToastProvider } from './components/ui/toast/ToastProvider';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/features.css';
import './styles/social.css';
import './styles/chat.css';
import './styles/matching.css';
import './styles/forum.css';
import './styles/map.css';
import './styles/settings.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element');

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  </StrictMode>,
);
