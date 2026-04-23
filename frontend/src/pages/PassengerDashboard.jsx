import React from 'react';

const stats = [
  { label: 'Upcoming rides', value: '3', accent: '#1d4ed8' },
  { label: 'Pending requests', value: '1', accent: '#0f766e' },
  { label: 'Saved drivers', value: '5', accent: '#d97706' },
];

const rides = [
  {
    route: 'North Shore to City Campus',
    departure: '8:15 AM',
    driver: 'Mia Thompson',
    seats: '2 seats left',
    price: '$4',
    status: 'Open',
  },
  {
    route: 'South Campus to AUT North',
    departure: '12:40 PM',
    driver: 'Arjun Patel',
    seats: '1 seat left',
    price: '$3',
    status: 'Requested',
  },
  {
    route: 'City Campus to Henderson',
    departure: '5:30 PM',
    driver: 'Ruby Chen',
    seats: '4 seats left',
    price: '$5',
    status: 'Open',
  },
];

function PassengerDashboard() {
  return (
    <div style={layoutStyle}>
      <section style={heroCardStyle}>
        <div>
          <span style={eyebrowStyle}>Passenger View</span>
          <h2 style={headlineStyle}>Book a ride in a few taps</h2>
          <p style={copyStyle}>
            This dashboard gives the lecturer a clear passenger-side story: discover trips, monitor requests,
            and keep key travel details visible at a glance.
          </p>
        </div>

        <div style={statsRowStyle}>
          {stats.map((stat) => (
            <div key={stat.label} style={statCardStyle}>
              <span style={{ ...statValueStyle, color: stat.accent }}>{stat.value}</span>
              <span style={statLabelStyle}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h3 style={sectionTitleStyle}>Available campus rides</h3>
            <p style={sectionCopyStyle}>Example trip cards to demonstrate booking and status tracking.</p>
          </div>
          <button type="button" style={primaryButtonStyle}>
            Find more rides
          </button>
        </div>

        <div style={rideListStyle}>
          {rides.map((ride) => (
            <article key={`${ride.route}-${ride.departure}`} style={rideCardStyle}>
              <div style={rideTopRowStyle}>
                <span style={routeStyle}>{ride.route}</span>
                <span style={rideStatusStyle}>{ride.status}</span>
              </div>
              <p style={metaStyle}>{ride.departure}</p>
              <p style={metaStyle}>Driver: {ride.driver}</p>
              <div style={rideFooterStyle}>
                <span style={seatStyle}>{ride.seats}</span>
                <strong style={priceStyle}>{ride.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={twoColumnStyle}>
        <article style={sectionCardStyle}>
          <h3 style={sectionTitleStyle}>My requests</h3>
          <div style={requestItemStyle}>
            <strong style={requestTitleStyle}>Request awaiting approval</strong>
            <p style={sectionCopyStyle}>South Campus to AUT North, 12:40 PM</p>
            <p style={sectionCopyStyle}>Driver will confirm once they review open seats.</p>
          </div>
          <div style={requestItemStyle}>
            <strong style={requestTitleStyle}>Confirmed ride</strong>
            <p style={sectionCopyStyle}>North Shore to City Campus, Monday 8:15 AM</p>
            <p style={sectionCopyStyle}>Pickup pinned near Gate 3. In-app messages stay attached to the trip.</p>
          </div>
        </article>

        <article style={sectionCardStyle}>
          <h3 style={sectionTitleStyle}>Travel preferences</h3>
          <div style={preferenceListStyle}>
            <div style={preferenceRowStyle}>
              <span style={preferenceLabelStyle}>Default pickup</span>
              <strong style={preferenceValueStyle}>AUT City Library</strong>
            </div>
            <div style={preferenceRowStyle}>
              <span style={preferenceLabelStyle}>Accessibility note</span>
              <strong style={preferenceValueStyle}>Prefer easy entry vehicles</strong>
            </div>
            <div style={preferenceRowStyle}>
              <span style={preferenceLabelStyle}>Payment method</span>
              <strong style={preferenceValueStyle}>Campus wallet</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

const layoutStyle = {
  display: 'grid',
  gap: '20px',
};

const heroCardStyle = {
  display: 'grid',
  gap: '18px',
  padding: '28px',
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 52%, #f8fafc 100%)',
  border: '1px solid rgba(59, 130, 246, 0.18)',
  boxShadow: '0 20px 45px rgba(37, 99, 235, 0.08)',
};

const eyebrowStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: '999px',
  backgroundColor: 'rgba(29, 78, 216, 0.1)',
  color: '#1d4ed8',
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
  maxWidth: '720px',
};

const statsRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '14px',
};

const statCardStyle = {
  display: 'grid',
  gap: '6px',
  padding: '18px',
  borderRadius: '18px',
  backgroundColor: 'rgba(255, 255, 255, 0.88)',
};

const statValueStyle = {
  fontSize: '1.9rem',
  fontWeight: 800,
};

const statLabelStyle = {
  color: '#475569',
  fontSize: '0.92rem',
};

const sectionCardStyle = {
  padding: '24px',
  borderRadius: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  boxShadow: '0 16px 34px rgba(15, 23, 42, 0.06)',
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '18px',
  flexWrap: 'wrap',
};

const sectionTitleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: '1.3rem',
};

const sectionCopyStyle = {
  marginTop: '6px',
  color: '#52607a',
  lineHeight: 1.65,
};

const primaryButtonStyle = {
  border: 'none',
  borderRadius: '999px',
  backgroundColor: '#1d4ed8',
  color: '#ffffff',
  padding: '12px 18px',
  fontWeight: 700,
  cursor: 'pointer',
};

const rideListStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
};

const rideCardStyle = {
  padding: '18px',
  borderRadius: '20px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(148, 163, 184, 0.22)',
};

const rideTopRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
};

const routeStyle = {
  color: '#0f172a',
  fontWeight: 700,
  lineHeight: 1.5,
};

const rideStatusStyle = {
  borderRadius: '999px',
  padding: '6px 10px',
  backgroundColor: '#dbeafe',
  color: '#1d4ed8',
  fontSize: '0.82rem',
  fontWeight: 700,
};

const metaStyle = {
  marginTop: '10px',
  color: '#52607a',
};

const rideFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '18px',
};

const seatStyle = {
  color: '#0f766e',
  fontWeight: 700,
};

const priceStyle = {
  color: '#0f172a',
};

const twoColumnStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
};

const requestItemStyle = {
  padding: '16px 0',
  borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
};

const requestTitleStyle = {
  color: '#0f172a',
};

const preferenceListStyle = {
  display: 'grid',
  gap: '14px',
  marginTop: '18px',
};

const preferenceRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  padding: '14px 16px',
  borderRadius: '16px',
  backgroundColor: '#f8fafc',
};

const preferenceLabelStyle = {
  color: '#475569',
};

const preferenceValueStyle = {
  color: '#0f172a',
};

export default PassengerDashboard;
