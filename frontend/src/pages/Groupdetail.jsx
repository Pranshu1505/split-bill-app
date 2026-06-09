// import { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';

// const CAT_EMOJI = { food: '🍕', travel: '✈️', shopping: '🛍️', entertainment: '🎬', utilities: '💡', other: '💰' };
// const CAT_COLORS = { food: 'cat-food', travel: 'cat-travel', shopping: 'cat-shopping', entertainment: 'cat-entertainment', utilities: 'cat-utilities', other: 'cat-other' };
// const AVATAR_COLORS = ['#6c63ff','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

// // Helper: get display name for a member
// const getMemberName = (m) => m.user ? m.user.name : m.guestName;
// const getMemberId = (m) => m.user ? m.user._id : `guest:${m.guestName}`;

// export default function GroupDetail() {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [group, setGroup] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [balances, setBalances] = useState(null);
//   const [tab, setTab] = useState('expenses');
//   const [loading, setLoading] = useState(true);
//   const [showAdd, setShowAdd] = useState(false);
//   const [showAddMember, setShowAddMember] = useState(false);
//   const [newMember, setNewMember] = useState({ type: 'email', value: '' });
//   const [form, setForm] = useState({ title: '', amount: '', paidByIndex: 0, splitType: 'equal', category: 'other', notes: '' });
//   const [adding, setAdding] = useState(false);

//   const load = useCallback(async () => {
//     try {
//       const [gRes, eRes, bRes] = await Promise.all([
//         api.get(`/groups/${id}`),
//         api.get(`/expenses/group/${id}`),
//         api.get(`/expenses/group/${id}/balances`),
//       ]);
//       setGroup(gRes.data);
//       setExpenses(eRes.data);
//       setBalances(bRes.data);
//     } catch {
//       toast.error('Data load nahi hua');
//       navigate('/');
//     } finally {
//       setLoading(false);
//     }
//   }, [id, navigate]);

//   useEffect(() => { load(); }, [load]);

//   const addExpense = async e => {
//     e.preventDefault();
//     if (!form.title || !form.amount) { toast.error('Title aur amount bharo'); return; }
//     setAdding(true);
//     try {
//       const paidByMember = group.members[form.paidByIndex];
//       const paidBy = paidByMember.user ? paidByMember.user._id : null;
//       const paidByGuest = paidByMember.user ? '' : paidByMember.guestName;

//       await api.post('/expenses', {
//         groupId: id,
//         title: form.title,
//         amount: parseFloat(form.amount),
//         paidBy,
//         paidByGuest,
//         splitType: form.splitType,
//         category: form.category,
//         notes: form.notes,
//       });
//       toast.success('Expense add ho gaya!');
//       setShowAdd(false);
//       setForm(f => ({ ...f, title: '', amount: '', notes: '' }));
//       load();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Error');
//     } finally {
//       setAdding(false);
//     }
//   };

//   const deleteExpense = async (expId) => {
//     if (!confirm('Delete karna chahte ho?')) return;
//     try {
//       await api.delete(`/expenses/${expId}`);
//       toast.success('Deleted!');
//       load();
//     } catch { toast.error('Delete nahi hua'); }
//   };

//   const addMember = async e => {
//     e.preventDefault();
//     try {
//       const payload = newMember.type === 'email'
//         ? { email: newMember.value }
//         : { guestName: newMember.value };
//       const res = await api.post(`/groups/${id}/members`, payload);
//       setGroup(res.data);
//       setNewMember({ type: 'email', value: '' });
//       setShowAddMember(false);
//       toast.success('Member add ho gaya!');
//       load();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Error');
//     }
//   };

//   const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);

//   const getPaidByName = (exp) => {
//     if (exp.paidByGuest) return exp.paidByGuest + ' 👤';
//     return exp.paidBy?.name || 'Unknown';
//   };

//   if (loading) return <div className="loading-page"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

//   return (
//     <div className="page container">
//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
//         <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>← Back</button>
//         <div style={{ flex: 1 }}>
//           <h1 className="page-title">{group.name}</h1>
//           {group.description && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{group.description}</p>}
//         </div>
//         <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Expense</button>
//       </div>

//       {/* Stats */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
//         {[
//           { label: 'Total Spent', val: `₹${totalSpent.toLocaleString('en-IN')}` },
//           { label: 'Members', val: group.members.length },
//           { label: 'Expenses', val: expenses.length },
//         ].map(s => (
//           <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
//             <div style={{ fontSize: 22, fontWeight: 700 }}>{s.val}</div>
//             <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Add Expense Form */}
//       {showAdd && (
//         <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
//           <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Naya expense add karo</h3>
//           <form onSubmit={addExpense}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//               <div className="form-group">
//                 <label className="form-label">Title *</label>
//                 <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Dinner, Petrol..." required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Amount (₹) *</label>
//                 <input className="form-input" type="number" min="0" step="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500" required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Kisne diya</label>
//                 <select className="form-input form-select" value={form.paidByIndex}
//                   onChange={e => setForm(f => ({ ...f, paidByIndex: parseInt(e.target.value) }))}>
//                   {group.members.map((m, i) => (
//                     <option key={i} value={i}>
//                       {getMemberName(m)}
//                       {m.user && m.user._id === user._id ? ' (tum)' : ''}
//                       {!m.user ? ' 👤' : ''}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Category</label>
//                 <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
//                   {Object.keys(CAT_EMOJI).map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="form-group">
//               <label className="form-label">Notes</label>
//               <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional..." />
//             </div>
//             <div style={{ display: 'flex', gap: 8 }}>
//               <button className="btn btn-primary" type="submit" disabled={adding}>
//                 {adding ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Add karo'}
//               </button>
//               <button className="btn btn-outline" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Tabs */}
//       <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
//         {['expenses', 'balances', 'members'].map(t => (
//           <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
//             {t === 'expenses' ? '💳 Expenses' : t === 'balances' ? '⚖️ Balances' : '👥 Members'}
//           </button>
//         ))}
//       </div>

//       {/* Expenses Tab */}
//       {tab === 'expenses' && (
//         <div className="card">
//           {expenses.length === 0 ? (
//             <div className="empty-state" style={{ padding: '2rem' }}>
//               <div className="icon">💳</div>
//               <h3>Koi expense nahi abhi</h3>
//               <p>Upar "+ Expense" se add karo</p>
//             </div>
//           ) : expenses.map(exp => (
//             <div key={exp._id} className="expense-item">
//               <div className={`avatar ${CAT_COLORS[exp.category]}`} style={{ width: 40, height: 40 }}>
//                 {CAT_EMOJI[exp.category]}
//               </div>
//               <div className="expense-info">
//                 <div className="expense-title">{exp.title}</div>
//                 <div className="expense-meta">
//                   {getPaidByName(exp)} ne diya · {new Date(exp.date).toLocaleDateString('en-IN')}
//                   {exp.notes && ` · ${exp.notes}`}
//                 </div>
//               </div>
//               <div>
//                 <div className="expense-amount">₹{exp.amount.toLocaleString('en-IN')}</div>
//                 <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{exp.splitType}</div>
//               </div>
//               <button onClick={() => deleteExpense(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, marginLeft: 4 }}
//                 onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
//                 onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>🗑️</button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Balances Tab */}
//       {tab === 'balances' && balances && (
//         <div>
//           <div className="card" style={{ marginBottom: '1rem' }}>
//             <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Kaun kisko dega</h3>
//             {balances.transactions.length === 0 ? (
//               <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
//                 ✅ Sab settle hai! Koi bhi kisi ka kuch nahi deta.
//               </div>
//             ) : balances.transactions.map((tx, i) => (
//               <div key={i} className="settle-item">
//                 <span style={{ fontWeight: 500 }}>{tx.from?.name}</span>
//                 {tx.from?.isGuest && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> 👤</span>}
//                 <span style={{ color: 'var(--text-muted)' }}>→</span>
//                 <span style={{ fontWeight: 500 }}>{tx.to?.name}</span>
//                 {tx.to?.isGuest && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> 👤</span>}
//                 <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--danger)' }}>₹{tx.amount.toLocaleString('en-IN')}</span>
//               </div>
//             ))}
//           </div>
//           <div className="card">
//             <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Individual balances</h3>
//             {balances.balances.map((b, i) => (
//               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
//                 <span style={{ fontWeight: 500 }}>{b.user?.name} {b.user?.isGuest ? '👤' : ''}</span>
//                 <span className={`badge ${b.balance > 0.01 ? 'badge-green' : b.balance < -0.01 ? 'badge-red' : 'badge-gray'}`}>
//                   {b.balance > 0.01 ? `+₹${b.balance}` : b.balance < -0.01 ? `-₹${Math.abs(b.balance)}` : 'Settled'}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Members Tab */}
//       {tab === 'members' && (
//         <div className="card">
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//             <h3 style={{ fontWeight: 600 }}>Members ({group.members.length})</h3>
//             {group.createdBy?._id === user._id && (
//               <button className="btn btn-outline btn-sm" onClick={() => setShowAddMember(!showAddMember)}>+ Add Member</button>
//             )}
//           </div>

//           {/* Add member form */}
//           {showAddMember && (
//             <form onSubmit={addMember} style={{ marginBottom: '1rem' }}>
//               <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
//                 <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
//                   <button type="button"
//                     onClick={() => setNewMember(m => ({ ...m, type: 'email', value: '' }))}
//                     style={{ padding: '8px 10px', fontSize: 12, border: 'none', cursor: 'pointer', background: newMember.type === 'email' ? 'var(--primary)' : 'var(--bg)', color: newMember.type === 'email' ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>
//                     📧 Email
//                   </button>
//                   <button type="button"
//                     onClick={() => setNewMember(m => ({ ...m, type: 'guest', value: '' }))}
//                     style={{ padding: '8px 10px', fontSize: 12, border: 'none', cursor: 'pointer', background: newMember.type === 'guest' ? 'var(--primary)' : 'var(--bg)', color: newMember.type === 'guest' ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>
//                     👤 Guest
//                   </button>
//                 </div>
//                 <input className="form-input" type={newMember.type === 'email' ? 'email' : 'text'}
//                   value={newMember.value}
//                   onChange={e => setNewMember(m => ({ ...m, value: e.target.value }))}
//                   placeholder={newMember.type === 'email' ? 'Email address' : 'Dost ka naam'}
//                   required style={{ flex: 1 }} />
//                 <button className="btn btn-primary btn-sm" type="submit">Add</button>
//               </div>
//             </form>
//           )}

//           {group.members.map((m, i) => {
//             const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
//             const name = getMemberName(m);
//             const isGuest = !m.user;
//             const isCurrentUser = m.user && m.user._id === user._id;
//             const isCreator = group.createdBy?._id === (m.user?._id);
//             return (
//               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
//                 <div className="avatar" style={{ background: c + '22', color: c }}>{name[0].toUpperCase()}</div>
//                 <div>
//                   <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     {name}
//                     {isCurrentUser && <span className="badge badge-blue" style={{ fontSize: 11 }}>Tum</span>}
//                     {isGuest && <span className="badge badge-gray" style={{ fontSize: 11 }}>👤 Guest</span>}
//                   </div>
//                   {m.user?.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.user.email}</div>}
//                 </div>
//                 {isCreator && <span className="badge badge-gray" style={{ marginLeft: 'auto', fontSize: 11 }}>Creator</span>}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }





import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authcontext';

const CAT_EMOJI = { food: '🍕', travel: '✈️', shopping: '🛍️', entertainment: '🎬', utilities: '💡', other: '💰' };
const CAT_COLORS = { food: 'cat-food', travel: 'cat-travel', shopping: 'cat-shopping', entertainment: 'cat-entertainment', utilities: 'cat-utilities', other: 'cat-other' };
const AVATAR_COLORS = ['#6c63ff','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

const getMemberName = (m) => m.user ? m.user.name : m.guestName;
const getMemberId = (m) => m.user ? m.user._id : `guest:${m.guestName}`;

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [tab, setTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(null); // holds transaction obj
  const [newMember, setNewMember] = useState({ type: 'email', value: '' });
  const [form, setForm] = useState({ title: '', amount: '', paidByIndex: 0, splitType: 'equal', category: 'other', notes: '' });
  const [adding, setAdding] = useState(false);
  const [settling, setSettling] = useState(false);

  const load = useCallback(async () => {
    try {
      const [gRes, eRes, bRes, sRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/expenses/group/${id}/balances`),
        api.get(`/settlements/group/${id}`),
      ]);
      setGroup(gRes.data);
      setExpenses(eRes.data);
      setBalances(bRes.data);
      setSettlements(sRes.data);
    } catch {
      toast.error('Data load nahi hua');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const addExpense = async e => {
    e.preventDefault();
    if (!form.title || !form.amount) { toast.error('Title aur amount bharo'); return; }
    setAdding(true);
    try {
      const paidByMember = group.members[form.paidByIndex];
      const paidBy = paidByMember.user ? paidByMember.user._id : null;
      const paidByGuest = paidByMember.user ? '' : paidByMember.guestName;
      await api.post('/expenses', {
        groupId: id, title: form.title, amount: parseFloat(form.amount),
        paidBy, paidByGuest, splitType: form.splitType, category: form.category, notes: form.notes,
      });
      toast.success('Expense add ho gaya!');
      setShowAdd(false);
      setForm(f => ({ ...f, title: '', amount: '', notes: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setAdding(false); }
  };

  const deleteExpense = async (expId) => {
    if (!confirm('Delete karna chahte ho?')) return;
    try {
      await api.delete(`/expenses/${expId}`);
      toast.success('Deleted!');
      load();
    } catch { toast.error('Delete nahi hua'); }
  };

  const addMember = async e => {
    e.preventDefault();
    try {
      const payload = newMember.type === 'email' ? { email: newMember.value } : { guestName: newMember.value };
      const res = await api.post(`/groups/${id}/members`, payload);
      setGroup(res.data);
      setNewMember({ type: 'email', value: '' });
      setShowAddMember(false);
      toast.success('Member add ho gaya!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  // Settle up — record a payment
  const handleSettle = async (tx) => {
    setSettling(true);
    try {
      const fromIsGuest = tx.fromId?.startsWith('guest:');
      const toIsGuest = tx.toId?.startsWith('guest:');
      await api.post('/settlements', {
        groupId: id,
        paidBy: fromIsGuest ? null : tx.fromId,
        paidByGuest: fromIsGuest ? tx.from.name : '',
        paidTo: toIsGuest ? null : tx.toId,
        paidToGuest: toIsGuest ? tx.to.name : '',
        amount: tx.amount,
        note: 'Settled up',
      });
      toast.success(`✅ ${tx.from.name} ne ${tx.to.name} ko ₹${tx.amount} diya!`);
      setShowSettleModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setSettling(false); }
  };

  const undoSettlement = async (sId) => {
    try {
      await api.delete(`/settlements/${sId}`);
      toast.success('Settlement undo ho gaya');
      load();
    } catch { toast.error('Undo nahi hua'); }
  };

  const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);
  const getPaidByName = (exp) => exp.paidByGuest ? exp.paidByGuest + ' 👤' : exp.paidBy?.name || 'Unknown';
  const isFullySettled = balances?.transactions?.length === 0;

  if (loading) return <div className="loading-page"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div className="page container">
      {/* Settle Up Modal */}
      {showSettleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💸</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Settle Up Confirm karo</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '1.5rem' }}>
              Kya <strong>{showSettleModal.from.name}</strong> ne <strong>{showSettleModal.to.name}</strong> ko <strong style={{ color: 'var(--primary)' }}>₹{showSettleModal.amount.toLocaleString('en-IN')}</strong> de diye?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => handleSettle(showSettleModal)} disabled={settling}>
                {settling ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '✅ Haan, diya!'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowSettleModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{group.name}</h1>
          {group.description && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{group.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Expense</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Spent', val: `₹${totalSpent.toLocaleString('en-IN')}` },
          { label: 'Members', val: group.members.length },
          { label: 'Expenses', val: expenses.length },
          { label: 'Status', val: isFullySettled ? '✅ Settled' : '⏳ Pending' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: `1px solid ${s.label === 'Status' && isFullySettled ? '#10b981' : 'var(--border)'}`, borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: s.label === 'Status' ? 14 : 20, fontWeight: 700, color: s.label === 'Status' && isFullySettled ? '#10b981' : 'var(--text)' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Expense Form */}
      {showAdd && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Naya expense add karo</h3>
          <form onSubmit={addExpense}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Dinner, Petrol..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-input" type="number" min="0" step="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500" required />
              </div>
              <div className="form-group">
                <label className="form-label">Kisne diya</label>
                <select className="form-input form-select" value={form.paidByIndex}
                  onChange={e => setForm(f => ({ ...f, paidByIndex: parseInt(e.target.value) }))}>
                  {group.members.map((m, i) => (
                    <option key={i} value={i}>
                      {getMemberName(m)}{m.user && m.user._id === user._id ? ' (tum)' : ''}{!m.user ? ' 👤' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {Object.keys(CAT_EMOJI).map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional..." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={adding}>
                {adding ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Add karo'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        {['expenses', 'balances', 'history', 'members'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>
            {t === 'expenses' ? '💳 Expenses' : t === 'balances' ? '⚖️ Balances' : t === 'history' ? '📋 History' : '👥 Members'}
          </button>
        ))}
      </div>

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className="card">
          {expenses.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">💳</div>
              <h3>Koi expense nahi abhi</h3>
              <p>Upar "+ Expense" se add karo</p>
            </div>
          ) : expenses.map(exp => (
            <div key={exp._id} className="expense-item">
              <div className={`avatar ${CAT_COLORS[exp.category]}`} style={{ width: 40, height: 40 }}>{CAT_EMOJI[exp.category]}</div>
              <div className="expense-info">
                <div className="expense-title">{exp.title}</div>
                <div className="expense-meta">{getPaidByName(exp)} ne diya · {new Date(exp.date).toLocaleDateString('en-IN')}{exp.notes && ` · ${exp.notes}`}</div>
              </div>
              <div>
                <div className="expense-amount">₹{exp.amount.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{exp.splitType}</div>
              </div>
              <button onClick={() => deleteExpense(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, marginLeft: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* Balances Tab */}
      {tab === 'balances' && balances && (
        <div>
          {/* Settle up cards */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
              Kaun kisko dega
              {isFullySettled && <span className="badge badge-green" style={{ marginLeft: 8 }}>All Settled ✅</span>}
            </h3>
            {balances.transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#10b981' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontWeight: 600 }}>Sab settle hai!</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Koi bhi kisi ka kuch nahi deta</div>
              </div>
            ) : balances.transactions.map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg)', borderRadius: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    <span style={{ color: 'var(--danger)' }}>{tx.from.name}</span>
                    {tx.from.isGuest && ' 👤'}
                    <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                    <span style={{ color: '#10b981' }}>{tx.to.name}</span>
                    {tx.to.isGuest && ' 👤'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>₹{tx.amount.toLocaleString('en-IN')} dena hai</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowSettleModal(tx)}
                  style={{ background: '#10b981', flexShrink: 0 }}>
                  ✅ Settle
                </button>
              </div>
            ))}
          </div>

          {/* Individual balances */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Individual balances</h3>
            {balances.balances.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 500 }}>{b.user?.name} {b.user?.isGuest ? '👤' : ''}</span>
                <span className={`badge ${b.balance > 0.01 ? 'badge-green' : b.balance < -0.01 ? 'badge-red' : 'badge-gray'}`}>
                  {b.balance > 0.01 ? `+₹${b.balance}` : b.balance < -0.01 ? `-₹${Math.abs(b.balance)}` : '✅ Settled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlement History Tab */}
      {tab === 'history' && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Settlement History</h3>
          {settlements.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">📋</div>
              <h3>Koi settlement nahi abhi</h3>
              <p>Balances tab mein "Settle" button dabao</p>
            </div>
          ) : settlements.map(s => {
            const fromName = s.paidByGuest || s.paidBy?.name || 'Unknown';
            const toName = s.paidToGuest || s.paidTo?.name || 'Unknown';
            return (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    <span style={{ color: 'var(--primary)' }}>{fromName}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                    <span style={{ color: '#10b981' }}>{toName}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(s.settledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {s.note && ` · ${s.note}`}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: '#10b981', marginRight: 8 }}>₹{s.amount.toLocaleString('en-IN')}</div>
                <button onClick={() => undoSettlement(s._id)}
                  title="Undo settlement"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>↩️</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600 }}>Members ({group.members.length})</h3>
            {group.createdBy?._id === user._id && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddMember(!showAddMember)}>+ Add Member</button>
            )}
          </div>
          {showAddMember && (
            <form onSubmit={addMember} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button type="button" onClick={() => setNewMember(m => ({ ...m, type: 'email', value: '' }))}
                    style={{ padding: '8px 10px', fontSize: 12, border: 'none', cursor: 'pointer', background: newMember.type === 'email' ? 'var(--primary)' : 'var(--bg)', color: newMember.type === 'email' ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>
                    📧 Email
                  </button>
                  <button type="button" onClick={() => setNewMember(m => ({ ...m, type: 'guest', value: '' }))}
                    style={{ padding: '8px 10px', fontSize: 12, border: 'none', cursor: 'pointer', background: newMember.type === 'guest' ? 'var(--primary)' : 'var(--bg)', color: newMember.type === 'guest' ? 'white' : 'var(--text-muted)', fontWeight: 500 }}>
                    👤 Guest
                  </button>
                </div>
                <input className="form-input" type={newMember.type === 'email' ? 'email' : 'text'}
                  value={newMember.value} onChange={e => setNewMember(m => ({ ...m, value: e.target.value }))}
                  placeholder={newMember.type === 'email' ? 'Email address' : 'Dost ka naam'}
                  required style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" type="submit">Add</button>
              </div>
            </form>
          )}
          {group.members.map((m, i) => {
            const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const name = getMemberName(m);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar" style={{ background: c + '22', color: c }}>{name[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {name}
                    {m.user && m.user._id === user._id && <span className="badge badge-blue" style={{ fontSize: 11 }}>Tum</span>}
                    {!m.user && <span className="badge badge-gray" style={{ fontSize: 11 }}>👤 Guest</span>}
                  </div>
                  {m.user?.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.user.email}</div>}
                </div>
                {group.createdBy?._id === m.user?._id && <span className="badge badge-gray" style={{ marginLeft: 'auto', fontSize: 11 }}>Creator</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}