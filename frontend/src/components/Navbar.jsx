import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const avatarColors = ['#6c63ff','#10b981','#f59e0b','#ef4444','#3b82f6'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const color = avatarColors[(user?.name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        💸 SplitBill
      </Link>
      {user && (
        <div className="navbar-actions">
          <div className="avatar" style={{ background: color + '22', color }}>
            {user.name[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}