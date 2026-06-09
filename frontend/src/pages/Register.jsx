import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password 6+ characters ka hona chahiye'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account ban gaya! 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💸</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>SplitBill</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Naya account banao</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Naam</label>
            <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Tumhara naam" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handle} placeholder="tumhara@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Register karo'}
          </button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Pehle se account hai? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Login karo</Link>
        </p>
      </div>
    </div>
  );
}