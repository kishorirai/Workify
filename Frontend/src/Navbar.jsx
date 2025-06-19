import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import flowerLogo from '../assets/flower_logo.png';

const defaultNavLinks = [
  { label: 'Dashboard', href: '/company-dashboard' },
  { label: 'Post Job', href: '/company-dashboard/post-job' },
  { label: 'Scheduled Interviews', href: '/company-dashboard/schedule-interview' }
];

const Navbar = ({ navLinks = defaultNavLinks, title = 'Company Portal', logo = flowerLogo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      padding: '0 2.5rem',
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
      position: 'fixed',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        cursor: 'pointer'
      }}>
        <img 
          src={logo} 
          alt="Logo" 
          style={{ 
            height: 48, 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
            transition: 'transform 0.2s ease',
          }} 
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <span style={{ 
          fontWeight: 800, 
          fontSize: 24, 
          letterSpacing: 0.5,
          textShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
        }}>
          {title}
        </span>
      </div>
      <div className="nav-links" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        {navLinks.map(link => (
          <Link
            key={link.href}
            to={link.href}
            style={{
              color: location.pathname === link.href ? '#6366f1' : '#fff',
              background: location.pathname === link.href ? '#fff' : 'transparent',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 16,
              padding: '10px 16px',
              borderRadius: 8,
              transition: 'all 0.2s ease',
              marginRight: 8,
              position: 'relative',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = location.pathname === link.href ? '#fff' : 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {link.label}
          </Link>
        ))}
        <button
          style={{
            marginLeft: 24,
            background: '#fff',
            color: '#6366f1',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 16,
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.2)';
          }}
        >
          Logout
        </button>
      </div>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          marginLeft: 16,
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
        }}
        className="nav-hamburger"
        aria-label="Toggle menu"
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ☰
      </button>
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: 72,
          right: 0,
          background: '#fff',
          color: '#6366f1',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
          borderRadius: '0 0 12px 12px',
          minWidth: 220,
          zIndex: 200,
          overflow: 'hidden',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              style={{
                display: 'block',
                padding: '16px 24px',
                color: '#6366f1',
                textDecoration: 'none',
                fontWeight: 600,
                borderBottom: '1px solid #e0e7ff',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#f5f3ff';
                e.currentTarget.style.paddingLeft = '28px';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.paddingLeft = '24px';
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            style={{
              width: '100%',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '16px 0',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 16,
              transition: 'background 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#4f46e5'}
            onMouseOut={e => e.currentTarget.style.background = '#6366f1'}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;