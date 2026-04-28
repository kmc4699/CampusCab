import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['New', 'In-Progress', 'Resolved'];

const STATUS_COLORS = {
  New: { background: '#fff3cd', color: '#856404' },
  'In-Progress': { background: '#cfe2ff', color: '#084298' },
  Resolved: { background: '#d1e7dd', color: '#0a3622' },
};

export default function UserModerationPage({ userId, userName, onBack }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/reports/${userId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load user reports');
        return r.json();
      })
      .then((data) => { setReports(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [userId]);

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdating(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={onBack}
        style={{ marginBottom: 20, padding: '8px 16px', cursor: 'pointer', borderRadius: 6, border: '1px solid #ccc', background: 'white' }}
      >
        ← Back to Dashboard
      </button>

      <h2 style={{ marginTop: 0 }}>Moderation: {userName}</h2>
      <p style={{ color: '#666', marginTop: -12, marginBottom: 24 }}>User ID: {userId}</p>

      {loading && <p>Loading reports...</p>}
      {error && <p style={{ color: '#dc3545' }}>Error: {error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p style={{ color: '#666' }}>No reports found for this user.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                border: '1px solid #dee2e6',
                borderRadius: 8,
                padding: 20,
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: '#6c757d',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}>
                    {report.violationType}
                  </span>
                  <p style={{ margin: '4px 0', fontWeight: 600 }}>Report Evidence</p>
                  <p style={{ margin: '4px 0', color: '#444' }}>{report.reason || 'No details provided.'}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#888' }}>
                    Reported by: {report.reporterId} &nbsp;|&nbsp;
                    {report.createdAt?.toDate
                      ? report.createdAt.toDate().toLocaleString()
                      : report.createdAt
                        ? new Date(report.createdAt._seconds * 1000).toLocaleString()
                        : 'Unknown date'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    ...STATUS_COLORS[report.status],
                  }}>
                    {report.status}
                  </span>
                  <select
                    value={report.status}
                    disabled={updating === report.id}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 13, cursor: 'pointer' }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
