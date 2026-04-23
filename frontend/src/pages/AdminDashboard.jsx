import React from 'react';

const metrics = [
  { label: 'Active drivers', value: '28', tone: '#0f766e' },
  { label: 'Open bookings', value: '41', tone: '#1d4ed8' },
  { label: 'Flags to review', value: '3', tone: '#dc2626' },
  { label: 'Average fill rate', value: '86%', tone: '#7c3aed' },
];

const moderationQueue = [
  {
    title: 'Repeated no-show report',
    detail: 'Passenger flagged a driver for missing two pickups this week.',
    status: 'High priority',
  },
  {
    title: 'Profile verification pending',
    detail: 'Three new drivers still need vehicle and licence review.',
    status: 'Needs review',
  },
  {
    title: 'Peak-hour demand spike',
    detail: 'City Campus to North Shore demand is outpacing supply after 5 PM.',
    status: 'Monitor',
  },
];

function AdminDashboard() {
  return (
    <div style={layoutStyle}>
      <section style={heroCardStyle}>
        <div>
          <span style={eyebrowStyle}>Admin View</span>
          <h2 style={headlineStyle}>Operate CampusCab from one control panel</h2>
          <p style={copyStyle}>
            This gives the lecturer a credible admin-side concept without needing the full backend workflow
            built yet. It shows moderation, system monitoring, and service performance in one place.
          </p>
        </div>

        <div style={metricGridStyle}>
          {metrics.map((metric) => (
            <div key={metric.label} style={metricCardStyle}>
              <span style={{ ...metricValueStyle, color: metric.tone }}>{metric.value}</span>
              <span style={metricLabelStyle}>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={contentGridStyle}>
        <article style={panelStyle}>
          <h3 style={panelTitleStyle}>Moderation queue</h3>
          <div style={stackStyle}>
            {moderationQueue.map((item) => (
              <div key={item.title} style={queueItemStyle}>
                <div style={queueHeaderStyle}>
                  <strong style={queueTitleStyle}>{item.title}</strong>
                  <span style={queueStatusStyle}>{item.status}</span>
                </div>
                <p style={queueDetailStyle}>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article style={panelStyle}>
          <h3 style={panelTitleStyle}>System health</h3>
          <div style={healthListStyle}>
            <div style={healthRowStyle}>
              <span style={healthLabelStyle}>Authentication</span>
              <strong style={healthyStyle}>Healthy</strong>
            </div>
            <div style={healthRowStyle}>
              <span style={healthLabelStyle}>Trip publishing</span>
              <strong style={healthyStyle}>Healthy</strong>
            </div>
            <div style={healthRowStyle}>
              <span style={healthLabelStyle}>Booking approvals</span>
              <strong style={warningStyle}>Watch</strong>
            </div>
            <div style={healthRowStyle}>
              <span style={healthLabelStyle}>Messaging latency</span>
              <strong style={healthyStyle}>Healthy</strong>
            </div>
          </div>
        </article>
      </section>

      <section style={panelStyle}>
        <div style={summaryHeaderStyle}>
          <div>
            <h3 style={panelTitleStyle}>Campus activity snapshot</h3>
            <p style={summaryCopyStyle}>Useful for explaining how the admin role oversees demand and trust.</p>
          </div>
          <button type="button" style={actionButtonStyle}>
            Export report
          </button>
        </div>

        <div style={timelineStyle}>
          <div style={timelineItemStyle}>
            <span style={timelineTimeStyle}>7:45 AM</span>
            <p style={timelineTextStyle}>Morning commute demand opened 12 new ride requests in 20 minutes.</p>
          </div>
          <div style={timelineItemStyle}>
            <span style={timelineTimeStyle}>12:10 PM</span>
            <p style={timelineTextStyle}>Admin approved 3 new drivers after document checks.</p>
          </div>
          <div style={timelineItemStyle}>
            <span style={timelineTimeStyle}>5:05 PM</span>
            <p style={timelineTextStyle}>Demand alert triggered for westbound routes after late classes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const layoutStyle = {
  display: 'grid',
  gap: '20px',
};

const heroCardStyle = {
  padding: '28px',
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 50%, #faf5ff 100%)',
  border: '1px solid rgba(124, 58, 237, 0.18)',
  boxShadow: '0 22px 48px rgba(124, 58, 237, 0.08)',
};

const eyebrowStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: '999px',
  backgroundColor: 'rgba(124, 58, 237, 0.12)',
  color: '#7c3aed',
  fontSize: '0.8rem',
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const headlineStyle = {
  margin: '16px 0 10px',
  color: '#0f172a',
  fontSize: '2rem',
};

const copyStyle = {
  color: '#334155',
  lineHeight: 1.7,
  maxWidth: '760px',
};

const metricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '14px',
  marginTop: '22px',
};

const metricCardStyle = {
  display: 'grid',
  gap: '6px',
  padding: '18px',
  borderRadius: '18px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
};

const metricValueStyle = {
  fontSize: '1.85rem',
  fontWeight: 800,
};

const metricLabelStyle = {
  color: '#475569',
};

const contentGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
};

const panelStyle = {
  padding: '24px',
  borderRadius: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  boxShadow: '0 16px 34px rgba(15, 23, 42, 0.06)',
};

const panelTitleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: '1.3rem',
};

const stackStyle = {
  display: 'grid',
  gap: '14px',
  marginTop: '18px',
};

const queueItemStyle = {
  padding: '16px',
  borderRadius: '18px',
  backgroundColor: '#f8fafc',
};

const queueHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
};

const queueTitleStyle = {
  color: '#0f172a',
};

const queueStatusStyle = {
  padding: '6px 10px',
  borderRadius: '999px',
  backgroundColor: '#ede9fe',
  color: '#7c3aed',
  fontSize: '0.8rem',
  fontWeight: 700,
};

const queueDetailStyle = {
  marginTop: '10px',
  color: '#52607a',
  lineHeight: 1.6,
};

const healthListStyle = {
  display: 'grid',
  gap: '12px',
  marginTop: '18px',
};

const healthRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: '16px',
  backgroundColor: '#f8fafc',
};

const healthLabelStyle = {
  color: '#334155',
};

const healthyStyle = {
  color: '#0f766e',
};

const warningStyle = {
  color: '#d97706',
};

const summaryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '14px',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const summaryCopyStyle = {
  marginTop: '6px',
  color: '#52607a',
  lineHeight: 1.65,
};

const actionButtonStyle = {
  border: 'none',
  borderRadius: '999px',
  backgroundColor: '#0f172a',
  color: '#ffffff',
  padding: '12px 18px',
  fontWeight: 700,
  cursor: 'pointer',
};

const timelineStyle = {
  display: 'grid',
  gap: '14px',
};

const timelineItemStyle = {
  display: 'grid',
  gridTemplateColumns: '100px 1fr',
  gap: '12px',
  padding: '16px',
  borderRadius: '18px',
  backgroundColor: '#f8fafc',
};

const timelineTimeStyle = {
  color: '#7c3aed',
  fontWeight: 800,
};

const timelineTextStyle = {
  margin: 0,
  color: '#334155',
  lineHeight: 1.6,
};

export default AdminDashboard;
