import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Compass, LayoutDashboard, Map, PlusCircle, Globe2, Search, LogOut, Settings, User, Bell } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-trips', label: 'My Trips', icon: Map },
  { to: '/trips/create', label: 'Create Trip', icon: PlusCircle },
  { to: '/cities', label: 'Explore Cities', icon: Search },
  { to: '/community', label: 'Community', icon: Globe2 },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get('/users/notifications').then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter(n => !n.read).length);
      }).catch(() => {});
    }
  }, [user]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      axios.put('/users/notifications/read').then(() => {
        setUnreadCount(0);
        setNotifications(notifications.map(n => ({...n, read: true})));
      }).catch(() => {});
    }
  };

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close sidebar on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '?';

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className={`hamburger ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="sidebar-logo-icon"><Compass size={18} color="var(--ink)" strokeWidth={2.5} /></div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Traveloop</span>
        </Link>
        <Link to="/profile">
          <div className="sidebar-user-avatar" style={{ width: 34, height: 34, fontSize: '0.7rem' }}>
            {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
          </div>
        </Link>
      </div>

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon"><Compass size={20} color="var(--ink)" strokeWidth={2.5} /></div>
          <span className="sidebar-logo-text">Traveloop</span>
        </Link>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', padding: 20 }}>
          <button onClick={handleLogout} className="sidebar-action-btn logout" style={{ width: '100%', justifyContent: 'flex-start' }}><LogOut size={14} /> Logout</button>
        </div>
      </aside>

      {/* Top Navigation */}
      <header className="top-nav">
        <div className="top-nav-right">
          <div className="notification-bell" onClick={handleNotificationClick}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="bell-dot">{unreadCount}</span>}
          </div>
          
          <div className="user-profile-trigger">
            <Link to="/profile" className="user-avatar-small">
              {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
            </Link>
            <div className="user-dropdown">
              <div className="dropdown-header">
                <strong>{user?.firstName} {user?.lastName}</strong>
                <span>{user?.email}</span>
              </div>
              <Link to="/profile" className="dropdown-item"><User size={14} /> My Profile</Link>
              <Link to="/profile?tab=settings" className="dropdown-item"><Settings size={14} /> Settings</Link>
              <button onClick={handleLogout} className="dropdown-item logout"><LogOut size={14} /> Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel">
          <h3>Notifications</h3>
          {notifications.length === 0 ? <p>No new notifications</p> : notifications.map(n => (
            <div key={n._id} className={`notif-item ${n.read ? 'read' : ''}`}>
              {n.type === 'follow' && <span><strong>{n.sender?.firstName}</strong> followed you</span>}
              {n.type === 'like' && <span><strong>{n.sender?.firstName}</strong> liked your trip</span>}
              {n.type === 'post' && <span><strong>{n.sender?.firstName}</strong> posted a trip</span>}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
