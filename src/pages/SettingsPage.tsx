import { useState } from 'react'

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  return (
    <>
      <div className="topbar">
        <h1 className="topbar-title">Settings</h1>
      </div>

      <div className="page-content fade-in" style={{ maxWidth: 640 }}>
        <div className="card settings-section">
          <div className="settings-section-title">Account</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Name</div>
              <div className="settings-row-desc">Your display name</div>
            </div>
            <input defaultValue="Zach Berling" style={{ width: 200 }} />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Email</div>
              <div className="settings-row-desc">Your account email</div>
            </div>
            <input defaultValue="zachberl@ventureproz.dev" style={{ width: 200 }} />
          </div>
        </div>

        <div className="card settings-section">
          <div className="settings-section-title">Preferences</div>
          <ToggleRow
            label="Push Notifications"
            desc="Receive alerts for new activity"
            value={notifications}
            onChange={setNotifications}
            testId="toggle-notifications"
          />
          <ToggleRow
            label="Dark Mode"
            desc="Use dark theme (default)"
            value={darkMode}
            onChange={setDarkMode}
            testId="toggle-dark-mode"
          />
          <ToggleRow
            label="Weekly Email Digest"
            desc="Get a summary of your CRM activity"
            value={emailDigest}
            onChange={setEmailDigest}
            testId="toggle-email-digest"
          />
        </div>

        <div className="card settings-section">
          <div className="settings-section-title">Danger Zone</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Delete Account</div>
              <div className="settings-row-desc">Permanently remove your account and all data</div>
            </div>
            <button className="btn btn-danger btn-sm">Delete Account</button>
          </div>
        </div>
      </div>
    </>
  )
}

function ToggleRow({ label, desc, value, onChange, testId }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void; testId?: string
}) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{desc}</div>
      </div>
      <button
        className={`toggle${value ? ' on' : ''}`}
        onClick={() => onChange(!value)}
        data-testid={testId}
        aria-pressed={value}
        aria-label={label}
      />
    </div>
  )
}
