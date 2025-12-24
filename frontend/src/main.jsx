import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'react-hot-toast'
import store, { persistor } from './store'
import App from './App.jsx'
import './App.css'
import './i18n/config'
import './utils/sw'

// Composant d'erreur globale
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Une erreur est survenue</h2>
      <p className="text-gray-600 mb-4">Nous nous excusons pour la gêne occasionnée.</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Réessayer
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">Détails de l'erreur</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">{error.message}</pre>
        </details>
      )}
    </div>
  </div>
);

// Composant de chargement pour la persistance
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
