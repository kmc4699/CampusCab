import { useState } from 'react';
import ReportedUsersDashboard from './ReportedUsersDashboard';
import UserModerationPage from './UserModerationPage';

const NAV_ITEMS = [
  { id: 'reported-users', label: 'Reported Users Dashboard' },
];

export default function AdminDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('reported-users');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (userId, userName) => {
    setSelectedUser({ userId, userName });
  };

  const handleBackToDashboard = () => {
    setSelectedUser(null);
  };

  const renderContent = () => {
    if (selectedUser) {
      return (
        <UserModerationPage
          userId={selectedUser.userId}
          userName={selectedUser.userName}
          onBack={handleBackToDashboard}
        />
      );
    }

    if (activePage === 'reported-users') {
      return <ReportedUsersDashboard onSelectUser={handleSelectUser} />;
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#1a1a2e',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e0e0ff' }}>CampusCab</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8888aa' }}>Admin Portal</p>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setSelectedUser(null); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px 20px',
                background: activePage === item.id && !selectedUser ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: activePage === item.id && !selectedUser ? 'white' : '#aaaacc',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activePage === item.id ? 600 : 400,
                borderLeft: activePage === item.id && !selectedUser ? '3px solid #6c63ff' : '3px solid transparent',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(220,53,69,0.2)',
              color: '#ff8080',
              border: '1px solid rgba(220,53,69,0.4)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f8f9fa', overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
}
