import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import VehicleProfile from './VehicleProfile';
import CreateTrip from './CreateTrip';
import DriverDashboard from './pages/DriverDashboard';
import Stepper from './components/Stepper';
import { buttons, colors, pills, radius, shadows, surfaces, typography } from './theme';

const dashboardOptions = [
  {
    id: 'driver',
    title: 'Driver',
    eyebrow: 'Offer rides',
    description: 'Publish trips, set your seats, and approve passengers heading your way.',
    accent: colors.driver,
    icon: '🧑‍✈️',
    highlights: ['Profile + vehicle', 'Trip creation', 'Request inbox'],
  },
  {
    id: 'passenger',
    title: 'Passenger',
    eyebrow: 'Book rides',
    description: 'Browse student drivers near you, request a seat, and get to campus on time.',
    accent: colors.passenger,
    icon: '🎒',
    highlights: ['Live trip feed', 'Request to join', 'Trip tracking'],
  },
  {
    id: 'admin',
    title: 'Admin',
    eyebrow: 'Run operations',
    description: 'Keep the platform safe — review reports, moderate users, and track activity.',
    accent: colors.admin,
    icon: '🛡️',
    highlights: ['Reports queue', 'User moderation', 'Analytics'],
  },
];

function ShellBackdrop() {
  return (
    <>
      <div
        style={surfaces.glow({
          top: '-180px',
          right: '-120px',
          background: 'rgba(37, 99, 235, 0.18)',
        })}
      />
      <div
        style={surfaces.glow({
          bottom: '-220px',
          left: '-120px',
          background: 'rgba(15, 118, 110, 0.18)',
        })}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 10%, rgba(29, 78, 216, 0.08), transparent 38%), radial-gradient(circle at 85% 85%, rgba(15, 118, 110, 0.09), transparent 32%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

function ProfileChip({ email }) {
  if (!email) return null;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 14px 6px 6px',
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.soft,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.accentSoft,
          color: colors.accent,
          fontWeight: 800,
          fontSize: '0.9rem',
        }}
      >
        {email.slice(0, 1).toUpperCase()}
      </span>
      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: colors.text }}>{email}</span>
    </div>
  );
}

function RoleSelector({ onSelectRole, onLogout }) {
  const email = auth.currentUser?.email;

  return (
    <div style={surfaces.shell}>
      <ShellBackdrop />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '56px 24px 48px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: radius.md,
                background: 'linear-gradient(135deg, #0f766e, #1d4ed8)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: shadows.soft,
              }}
            >
              CC
            </div>
            <div>
              <div style={{ ...typography.eyebrow, color: colors.textSubtle }}>CampusCab</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>Student carpool</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ProfileChip email={email} />
            <button type="button" onClick={onLogout} style={buttons.subtle}>
              Log out
            </button>
          </div>
        </header>

        <section style={{ maxWidth: '720px', marginBottom: '40px' }}>
          <span style={{ ...pills.base, ...pills.muted, marginBottom: '18px' }}>
            <span aria-hidden="true">✨</span> Welcome back
          </span>
          <h1 style={{ ...typography.display, margin: '18px 0 14px' }}>
            Which dashboard do you want to open?
          </h1>
          <p style={{ ...typography.body, fontSize: '1.05rem', maxWidth: '600px', margin: 0 }}>
            Pick a role to jump into. You can switch between them at any time — your setup is saved to your
            account.
          </p>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {dashboardOptions.map((option) => (
            <RoleCard key={option.id} option={option} onSelect={() => onSelectRole(option.id)} />
          ))}
        </div>

        <footer style={{ marginTop: '40px', ...typography.small, textAlign: 'center' }}>
          Use this selector during marking to switch views without signing out.
        </footer>
      </div>
    </div>
  );
}

function RoleCard({ option, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: 'left',
        padding: '26px',
        borderRadius: radius.xl,
        border: `1px solid ${hovered ? option.accent + '44' : colors.border}`,
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: hovered ? shadows.lift : shadows.card,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: radius.md,
          background: `${option.accent}18`,
          color: option.accent,
          fontSize: '1.6rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}
      >
        <span aria-hidden="true">{option.icon}</span>
      </div>

      <div style={{ ...typography.eyebrow, color: option.accent, marginBottom: '6px' }}>{option.eyebrow}</div>
      <h2 style={{ margin: '0 0 8px', color: colors.text, fontSize: '1.45rem', fontWeight: 700 }}>
        {option.title}
      </h2>
      <p style={{ ...typography.body, marginTop: 0, marginBottom: '16px' }}>{option.description}</p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'grid', gap: '6px' }}>
        {option.highlights.map((item) => (
          <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '0.9rem' }}>
            <span
              aria-hidden="true"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: option.accent,
              }}
            />
            {item}
          </li>
        ))}
      </ul>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 800,
          color: option.accent,
          fontSize: '0.92rem',
        }}
      >
        Open dashboard
        <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}

function DashboardShell({ title, subtitle, badge, onBack, onLogout, children }) {
  const email = auth.currentUser?.email;
  return (
    <div style={surfaces.shell}>
      <ShellBackdrop />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 48px' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: '28px',
            padding: '14px 16px',
            borderRadius: radius.xl,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.soft,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: radius.md,
                background: 'linear-gradient(135deg, #0f766e, #1d4ed8)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              CC
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ ...typography.eyebrow, color: colors.textSubtle }}>CampusCab</div>
              <div style={{ fontWeight: 700, color: colors.text }}>{badge || title}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ProfileChip email={email} />
            <button type="button" onClick={onBack} style={buttons.subtle}>
              Switch dashboard
            </button>
            <button type="button" onClick={onLogout} style={buttons.danger}>
              Log out
            </button>
          </div>
        </header>

        <section style={{ marginBottom: '24px' }}>
          <h1 style={{ ...typography.display, margin: '6px 0 10px' }}>{title}</h1>
          {subtitle && <p style={{ ...typography.body, fontSize: '1.02rem', maxWidth: '720px', margin: 0 }}>{subtitle}</p>}
        </section>

        <main style={{ display: 'grid', gap: '20px' }}>{children}</main>
      </div>
    </div>
  );
}

function Card({ children, padding = 0 }) {
  return (
    <section
      style={{
        ...surfaces.card,
        padding,
        overflow: 'hidden',
      }}
    >
      {children}
    </section>
  );
}

function DriverOnboarding({ vehicle, onSetVehicle, onFinish }) {
  const [step, setStep] = useState(0);
  const email = auth.currentUser?.email;

  const steps = [
    { key: 'welcome', label: 'Account' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'ready', label: 'Ready' },
  ];

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card padding="28px 32px 12px">
        <div style={{ textAlign: 'center' }}>
          <span style={{ ...pills.base, ...pills.accent }}>
            <span aria-hidden="true">🧑‍✈️</span> Driver setup
          </span>
          <h2 style={{ ...typography.h2, margin: '14px 0 6px' }}>Let's get your driver profile ready</h2>
          <p style={{ ...typography.body, maxWidth: '540px', margin: '0 auto' }}>
            A few quick steps before you publish your first ride. Your details are saved securely to your
            account.
          </p>
        </div>

        <div style={{ marginTop: '26px' }}>
          <Stepper steps={steps} activeIndex={step} />
        </div>
      </Card>

      {step === 0 && (
        <Card padding="32px">
          <div style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(15,118,110,0.18), rgba(29,78,216,0.16))',
                color: colors.accent,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                marginBottom: '18px',
              }}
              aria-hidden="true"
            >
              👋
            </div>
            <h3 style={{ ...typography.h2, margin: '0 0 8px' }}>
              Welcome{email ? `, ${email.split('@')[0]}` : ''}
            </h3>
            <p style={{ ...typography.body, margin: '0 0 10px' }}>
              You're signed in with your AUT email. Drivers need a vehicle profile before publishing trips —
              it only takes a minute.
            </p>

            <div
              style={{
                margin: '22px auto 0',
                padding: '12px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: radius.pill,
                backgroundColor: colors.successSoft,
                color: colors.success,
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              ✓ Account verified {email ? `(${email})` : ''}
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setStep(1)} style={buttons.accent}>
                Continue to vehicle setup →
              </button>
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <VehicleProfile
            onSaved={(data) => {
              onSetVehicle(data);
              setStep(2);
            }}
          />
          <div
            style={{
              padding: '16px 32px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <button type="button" onClick={() => setStep(0)} style={buttons.subtle}>
              ← Back
            </button>
            <p style={{ ...typography.small, margin: 0 }}>
              Save to continue — we'll take you to your dashboard next.
            </p>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card padding="32px">
          <div style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: colors.successSoft,
                color: colors.success,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                marginBottom: '18px',
              }}
              aria-hidden="true"
            >
              🎉
            </div>
            <h3 style={{ ...typography.h2, margin: '0 0 8px' }}>You're all set</h3>
            <p style={{ ...typography.body, margin: '0 0 18px' }}>
              {vehicle
                ? `Your ${vehicle.make || ''} ${vehicle.model || ''} (${vehicle.licensePlate}) is saved. Publish your first trip whenever you're ready.`
                : 'Your vehicle is saved. Publish your first trip whenever you are ready.'}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={onFinish} style={buttons.accent}>
                Open driver dashboard →
              </button>
              <button type="button" onClick={() => setStep(1)} style={buttons.subtle}>
                Edit vehicle
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function DriverExperience() {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'vehicles', user.uid));
        if (snap.exists()) {
          setVehicle(snap.data());
          setOnboardingComplete(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Card padding="40px">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: `3px solid ${colors.border}`,
              borderTopColor: colors.accent,
              margin: '0 auto 18px',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h3 style={{ ...typography.h3, margin: '0 0 4px' }}>Loading your driver profile…</h3>
          <p style={{ ...typography.body, margin: 0 }}>
            Fetching your saved vehicle from Firebase.
          </p>
        </div>
      </Card>
    );
  }

  if (!vehicle || !onboardingComplete) {
    return (
      <DriverOnboarding
        vehicle={vehicle}
        onSetVehicle={setVehicle}
        onFinish={() => setOnboardingComplete(true)}
      />
    );
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <Card>
        <VehicleProfile initialVehicle={vehicle} onSaved={setVehicle} compact />
      </Card>
      <Card>
        <CreateTrip />
      </Card>
      <Card>
        <DriverDashboard />
      </Card>
    </div>
  );
}

function DashboardPlaceholder({ role }) {
  return (
    <div
      style={{
        ...surfaces.card,
        padding: '48px 32px',
        textAlign: 'center',
      }}
    >
      <span style={{ ...pills.base, ...pills.muted }}>Coming soon</span>
      <h2 style={{ ...typography.h2, margin: '18px 0 8px' }}>{role} dashboard</h2>
      <p style={{ ...typography.body, maxWidth: '520px', margin: '0 auto' }}>
        This view hasn't been built yet. The selector is here so you can switch between roles during the
        demo without signing out.
      </p>
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
        title="Driver dashboard"
        subtitle="Manage your vehicle, publish trips, and review passenger requests — all in one place."
        badge="Driver"
        onBack={() => setSelectedRole('')}
        onLogout={handleLogout}
      >
        <DriverExperience />
      </DashboardShell>
    );
  }

  if (selectedRole === 'passenger') {
    return (
      <DashboardShell
        title="Passenger dashboard"
        subtitle="Selection entry for the passenger side of CampusCab."
        badge="Passenger"
        onBack={() => setSelectedRole('')}
        onLogout={handleLogout}
      >
        <DashboardPlaceholder role="Passenger" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Selection entry for the admin side of CampusCab."
      badge="Admin"
      onBack={() => setSelectedRole('')}
      onLogout={handleLogout}
    >
      <DashboardPlaceholder role="Admin" />
    </DashboardShell>
  );
}

export default App;
