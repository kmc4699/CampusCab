import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { FIRESTORE_COLLECTIONS } from '../firestoreModel';

const VIOLATION_TYPES = ['All', 'Hate Speech', 'Inappropriate Content', 'Spam', 'Harassment', 'Other'];

const STATUS_COLORS = {
  New: { background: '#fff3cd', color: '#856404' },
  'In-Progress': { background: '#cfe2ff', color: '#084298' },
  Resolved: { background: '#d1e7dd', color: '#0a3622' },
};

export default function ReportedUsersDashboard({ onSelectUser }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, FIRESTORE_COLLECTIONS.reports),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        const grouped = {};
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() };
          const uid = data.reportedUserId;

          if (!grouped[uid]) {
            grouped[uid] = {
              reportedUserId: uid,
              reportedUserName: data.reportedUserName || uid,
              reports: [],
              recentCount: 0,
              status: 'New',
            };
          }

          grouped[uid].reports.push(data);

          const reportTime = data.createdAt?.toMillis?.() ?? 0;
          if (now - reportTime < twentyFourHours) {
            grouped[uid].recentCount += 1;
          }

          const statusPriority = { New: 2, 'In-Progress': 1, Resolved: 0 };
          if ((statusPriority[data.status] ?? 0) > (statusPriority[grouped[uid].status] ?? 0)) {
            grouped[uid].status = data.status;
          }
        });

        const result = Object.values(grouped).map((user) => {
          const counts = {};
          user.reports.forEach((r) => {
            counts[r.violationType] = (counts[r.violationType] || 0) + 1;
          });
          const topViolation =
            Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

          return {
            reportedUserId: user.reportedUserId,
            reportedUserName: user.reportedUserName,
            topViolationType: topViolation,
            reportCount: user.reports.length,
            isHighPriority: user.recentCount > 5,
            status: user.status,
          };
        });

        result.sort((a, b) => b.isHighPriority - a.isHighPriority || b.reportCount - a.reportCount);
        setReports(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = filter === 'All'
    ? reports
    : reports.filter((r) => r.topViolationType === filter);

  if (loading) return <p style={{ padding: 24 }}>Loading reports...</p>;
  if (error) return <p style={{ padding: 24, color: '#dc3545' }}>Error: {error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Reported Users Dashboard</h2>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontWeight: 600 }}>Filter by Violation Type:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }}
        >
          {VIOLATION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span style={{ color: '#666', fontSize: 13 }}>{filtered.length} result(s)</span>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#666' }}>No reported users found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                <th style={th}>User ID</th>
                <th style={th}>Name</th>
                <th style={th}>Top Violation</th>
                <th style={th}>No. of Reports</th>
                <th style={th}>Status</th>
                <th style={th}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.reportedUserId}
                  onClick={() => onSelectUser(row.reportedUserId, row.reportedUserName)}
                  style={{
                    cursor: 'pointer',
                    background: row.isHighPriority ? '#fff5f5' : 'white',
                    borderLeft: row.isHighPriority ? '4px solid #dc3545' : '4px solid transparent',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = row.isHighPriority ? '#ffe0e0' : '#f0f4ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = row.isHighPriority ? '#fff5f5' : 'white'}
                >
                  <td style={td}>{row.reportedUserId}</td>
                  <td style={td}>{row.reportedUserName}</td>
                  <td style={td}>{row.topViolationType}</td>
                  <td style={td}>{row.reportCount}</td>
                  <td style={td}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      ...STATUS_COLORS[row.status],
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={td}>
                    {row.isHighPriority && (
                      <span style={{
                        background: '#dc3545',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        High Priority
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: '10px 14px',
  borderBottom: '2px solid #dee2e6',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const td = {
  padding: '10px 14px',
  borderBottom: '1px solid #dee2e6',
};
