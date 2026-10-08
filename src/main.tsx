import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { App } from '@/App';
import { ErrorFallback } from '@/components/ErrorFallback';
import { CONSOLE_MESSAGES } from '@/constants';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error) => console.error(CONSOLE_MESSAGES.renderError, error)}
      >
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
