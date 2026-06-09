import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authcontext';

const COLORS = ['#6c63ff', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Home() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  // Dynamic member rows: { type: 'email'|'guest', value: '' }
  const [memberRows, setMemberRows] = useState([{ type: 'email', value: '' }]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/groups')
      .then(r => setGroups(r.data))
      .catch(() => toast.error('Groups load nahi hue'))
      .finally(() => setLoading(false));
  }, []);

  const addMemberRow = (type) => setMemberRows(r => [...r, { type, value: '' }]);
  const removeMemberRow = (i) => setMemberRows(r => r.filter((_, idx) => idx !== i));
  const updateRow = (i, value) => setMemberRows(r => r.map((row, idx) => idx === i ? { ...row, value } : row));

  const createGroup = async e => {
    e.preventDefault();
    setCreating(true);
    try {
      const memberEmails = memberRows.filter(r => r.type === 'email' && r.value.trim()).map(r => r.value.trim());
      const guestNames = memberRows.filter(r => r.type === 'guest' && r.value.trim()).map(r => r.value.trim());

      const res = await api.post('/groups', { name: form.name, description: form.description, memberEmails, guestNames });
      setGroups(g => [res.data, ...g]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      setMemberRows([{ type: 'email', value: '' }]);
      toast.success('Group ban gaya! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Namaste, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Apne groups manage karo</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Naya Group</button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Naya group banao</h3>
          <form onSubmit={createGroup}>
            <div className="form-group">
              <label className="form-label">Group ka naam *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Goa Trip, Flat Expenses..." required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional..." />
            </div>

            {/* Members section */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 8 }}>Members add karo</label>

              {memberRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  {/* Type toggle */}
                  <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <button type="button"
                      onClick={() => setMemberRows(r => r.map((row, idx) => idx === i ? { ...row, type: 'email', value: '' } : row))}
                      style={{ padding: '8px 10px', fontSize: 12, border: 'none', cursor: 'pointer', background: row.type === 'email' ? 'var(--primary)' : 'var(--bg)', color: row.type === 'email' ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>
                      📧 Email
                    </button>
                    <button type="button"
                      onClick={() => setMemberRows(r => r.map((row, idx) => idx === i ? { ...row, type: 'guest', value: '' } : row))}
                      style={{ padding: '8px 10px', fontSize: 12, border: 'none', cursor: 'pointer', background: row.type === 'guest' ? 'var(--primary)' : 'var(--bg)', color: row.type === 'guest' ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>
                      👤 Guest
                    </button>
                  </div>

                  <input
                    className="form-input"
                    value={row.value}
                    onChange={e => updateRow(i, e.target.value)}
                    placeholder={row.type === 'email' ? 'friend@gmail.com' : 'Dost ka naam'}
                    style={{ flex: 1 }}
                  />

                  {memberRows.length > 1 && (
                    <button type="button" onClick={() => removeMemberRow(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, padding: '0 4px' }}>✕</button>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => addMemberRow('email')}>+ Email se add</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => addMemberRow('guest')}>+ Guest add</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Banao'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => { setShowCreate(false); setMemberRows([{ type: 'email', value: '' }]); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👥</div>
          <h3>Koi group nahi hai abhi</h3>
          <p>Ek naya group banao aur apne doston ke saath expenses split karo</p>
        </div>
      ) : (
        <div className="grid-2">
          {groups.map((group, i) => (
            <Link to={`/groups/${group._id}`} key={group._id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s', height: '100%' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: COLORS[i % COLORS.length] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, color: COLORS[i % COLORS.length], fontWeight: 700 }}>
                    {group.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{group.name}</div>
                    {group.description && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{group.description}</div>}
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{group.members.length} members</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date(group.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}