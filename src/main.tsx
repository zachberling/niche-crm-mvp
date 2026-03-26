import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './styles/app.css'

Sentry.init({
  dsn: "https://ea5cf99ccae076739f231fc03ac995a2@o384379.ingest.us.sentry.io/4511108205182976",
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      isNameRequired: true,
      isEmailRequired: true,
    }),
  ],
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
})

// Verify Sentry is connected — remove after confirming events appear in dashboard
Sentry.captureMessage('Sentry initialized successfully', 'info')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
