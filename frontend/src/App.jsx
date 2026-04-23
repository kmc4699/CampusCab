import React, { useState } from 'react';
import Login from './Login';
import VehicleProfile from './VehicleProfile';
import CreateTrip from './CreateTrip';
import DriverDashboard from './pages/DriverDashboard';
import PassengerDashboard from './pages/PassengerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const dashboardOptions = [
  {
    id: 'driver',
    title: 'Driver Dashboard',
    eyebrow: 'Offer rides',
    description: 'Manage your vehicle, publish trips, and review ride requests from passengers.',
    accent: '#0f766e',
  },
  {
    id: 'passenger',
    title: 'Passenger Dashboard',
    eyebrow: 'Book rides',
    description: 'Browse upcoming rides, track requests, and keep your commute organised.',
    accent: '#1d4ed8',
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    eyebrow: 'Run operations',
    description: 'Monitor platform activity, moderate reports, and keep the service healthy.',
    accent: '#7c3aed',
  },
];

function RoleSelector({ onSelectRole, onLogout }) {
  return (
    <div style={shellStyle}>
      <div style={backdropStyle} />
      <div style={heroGlowTop} />
      <div style={heroGlowBottom} />

      <div style={selectorLayoutStyle}>
        <div style={selectorHeroStyle}>
          <span style={heroBadgeStyle}>CampusCab Lecturer Demo</span>
          <h1 style={heroTitleStyle}>Choose which dashboard to enter</h1>
          <p style={heroCopyStyle}>
            The lecturer can jump straight into the driver, passenger, or admin experience from one clean
            landing screen.
          </p>
        </div>

        <div style={roleGridStyle}>
          {dashboardOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectRole(option.id)}
              style={{
                ...roleCardStyle,
                borderColor: `${option.accent}22`,
              }}
            >
              <span style={{ ...roleEyebrowStyle, color: option.accent }}>{option.eyebrow}</span>
              <h2 style={roleTitleStyle}>{option.title}</h2>
              <p style={roleDescriptionStyle}>{option.description}</p>
              <span style={{ ...roleActionStyle, color: option.accent }}>
                Open dashboard
                <span aria-hidden="true">→</span>
              </span>
            </button>
          ))}
        </div>

        <div style={selectorFooterStyle}>
          <p style={selectorNoteStyle}>Use this screen during marking to switch views without changing accounts.</p>
          <button type="button" onClick={onLogout} style={secondaryButtonStyle}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardShell({ title, subtitle, onBack, onLogout, children }) {
  return (
    <div style={shellStyle}>
      <div style={backdropStyle} />
      <div style={heroGlowTop} />
      <div style={heroGlowBottom} />

      <div style={dashboardLayoutStyle}>
        <header style={dashboardHeaderStyle}>
          <div>
            <span style={heroBadgeStyle}>CampusCab</span>
            <h1 style={dashboardTitleStyle}>{title}</h1>
            <p style={dashboardSubtitleStyle}>{subtitle}</p>
          </div>

          <div style={headerActionsStyle}>
            <button type="button" onClick={onBack} style={secondaryButtonStyle}>
              Switch dashboard
            </button>
            <button type="button" onClick={onLogout} style={logoutButtonStyle}>
              Log Out
            </button>
          </div>
        </header>

        <main style={dashboardBodyStyle}>{children}</main>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleLogout = () => {
    setSelectedRole('');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!selectedRole) {
    return <RoleSelector onSelectRole={setSelectedRole} onLogout={handleLogout} />;
  }

  if (selectedRole === 'driver') {
    return (
      <DashboardShell
        title="Driver Dashboard"
        subtitle="Create rides, maintain your profile, and manage passenger approvals from one place."
        onBack={() => setSelectedRole('')}
        onLogout={handleLogout}
      >
        <div style={dashboardStackStyle}>
          <section style={surfaceCardStyle}>
            <VehicleProfile />
          </section>
          <section style={surfaceCardStyle}>
            <CreateTrip />
          </section>
          <section style={surfaceCardStyle}>
            <DriverDashboard />
          </section>
        </div>
      </DashboardShell>
    );
  }

  if (selectedRole === 'passenger') {
    return (
      <DashboardShell
        title="Passenger Dashboard"
        subtitle="Preview the student rider experience with active trips, bookings, and travel updates."
        onBack={() => setSelectedRole('')}
        onLogout={handleLogout}
      >
        <PassengerDashboard />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Show the operations view with system health, moderation tasks, and campus-wide activity."
      onBack={() => setSelectedRole('')}
      onLogout={handleLogout}
    >
      <AdminDashboard />
    </DashboardShell>
  );
}

const shellStyle = {
  position: 'relative',
  minHeight: '100vh',
  overflow: 'hidden',
  background: 'linear-gradient(160deg, #eff6ff 0%, #f8fafc 48%, #eef2ff 100%)',
};

const backdropStyle = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at top left, rgba(29, 78, 216, 0.12), transparent 32%), radial-gradient(circle at bottom right, rgba(15, 118, 110, 0.12), transparent 30%)',
};

const heroGlowTop = {
  position: 'absolute',
  top: '-160px',
  right: '-80px',
  width: '360px',
  height: '360px',
  borderRadius: '50%',
  background: 'rgba(37, 99, 235, 0.14)',
  filter: 'blur(30px)',
};

const heroGlowBottom = {
  position: 'absolute',
  bottom: '-200px',
  left: '-80px',
  width: '420px',
  height: '420px',
  borderRadius: '50%',
  background: 'rgba(15, 118, 110, 0.14)',
  filter: 'blur(36px)',
};

const selectorLayoutStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '72px 24px 48px',
};

const selectorHeroStyle = {
  maxWidth: '680px',
  marginBottom: '32px',
};

const heroBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  borderRadius: '999px',
  backgroundColor: 'rgba(15, 23, 42, 0.08)',
  color: '#1e293b',
  fontSize: '0.82rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const heroTitleStyle = {
  margin: '18px 0 12px',
  fontSize: 'clamp(2.4rem, 5vw, 4.2rem)',
  lineHeight: 1.02,
  color: '#0f172a',
  letterSpacing: '-0.04em',
};

const heroCopyStyle = {
  maxWidth: '620px',
  color: '#475569',
  fontSize: '1.05rem',
  lineHeight: 1.7,
};

const roleGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
};

const roleCardStyle = {
  textAlign: 'left',
  padding: '28px',
  borderRadius: '24px',
  border: '1px solid',
  background: 'rgba(255, 255, 255, 0.86)',
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(12px)',
  cursor: 'pointer',
};

const roleEyebrowStyle = {
  display: 'inline-block',
  marginBottom: '12px',
  fontSize: '0.8rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const roleTitleStyle = {
  margin: '0 0 10px',
  color: '#0f172a',
  fontSize: '1.45rem',
};

const roleDescriptionStyle = {
  color: '#475569',
  lineHeight: 1.7,
  minHeight: '84px',
};

const roleActionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  marginTop: '18px',
  fontWeight: 700,
};

const selectorFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginTop: '26px',
  flexWrap: 'wrap',
};

const selectorNoteStyle = {
  color: '#52607a',
  fontSize: '0.95rem',
};

const dashboardLayoutStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '48px 20px 32px',
};

const dashboardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '18px',
  marginBottom: '28px',
  flexWrap: 'wrap',
};

const dashboardTitleStyle = {
  margin: '14px 0 10px',
  color: '#0f172a',
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
};

const dashboardSubtitleStyle = {
  maxWidth: '700px',
  color: '#52607a',
  fontSize: '1rem',
  lineHeight: 1.7,
};

const headerActionsStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const baseButtonStyle = {
  border: 'none',
  borderRadius: '999px',
  padding: '12px 18px',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#e2e8f0',
  color: '#0f172a',
};

const logoutButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#0f172a',
  color: '#ffffff',
};

const dashboardBodyStyle = {
  display: 'grid',
  gap: '20px',
};

const dashboardStackStyle = {
  display: 'grid',
  gap: '20px',
};

const surfaceCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: '28px',
  padding: '8px',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
  overflow: 'hidden',
};

export default App;
