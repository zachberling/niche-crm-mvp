import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Sidebar } from '@/components/Sidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { Dashboard } from '@/pages/Dashboard'
import { Contacts } from '@/pages/Contacts'
import { JobsPage } from '@/pages/JobsPage'
import { EquipmentPage } from '@/pages/EquipmentPage'
import { AutomationsPage } from '@/pages/AutomationsPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'
import { ActivityPage } from '@/pages/ActivityPage'
import { Pricing } from '@/pages/Pricing'
import { SettingsPage } from '@/pages/SettingsPage'

function AppLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/automations" element={<AutomationsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  )
}
