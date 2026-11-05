import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from './AdminApp';
import '../styles/fonts.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/logo.css';
import '../styles/admin.css';
import '../styles/modal.css';
import '../styles/tabbar.css';
import '../styles/adminSettings.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
