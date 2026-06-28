'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.user, data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (e) {
      setError('Server unreachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#050508',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '55%', height: '70%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '55%', height: '70%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* ── LEFT PANEL – Branding ── */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(8,8,15,0.98) 100%)',
      }}>
        {/* Decorative grid lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        {/* Logo card */}
        <div style={{
          position: 'relative',
          marginBottom: '2.5rem',
          display: 'inline-flex',
        }}>
          <div style={{
            position: 'absolute', inset: '-20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '32px',
            overflow: 'hidden',
            padding: '0',
            boxShadow: '0 0 60px rgba(59,130,246,0.2), 0 25px 60px rgba(0,0,0,0.6)',
            position: 'relative',
            lineHeight: 0,
          }}>
            <Image
              src="/CODEGNAN LOGO.png"
              alt="Codegnan Logo"
              width={220}
              height={80}
              style={{ display: 'block', objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}>
          Inventory Portal
        </h1>

        <p style={{
          color: 'rgba(148,163,184,0.8)',
          fontSize: '1rem',
          textAlign: 'center',
          maxWidth: '280px',
          lineHeight: 1.6,
          marginBottom: '3rem',
        }}>
          Centralized asset management for the Codegnan network
        </p>


      </div>

      {/* ── RIGHT PANEL – Sign In ── */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Welcome back
            </p>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', margin: 0 }}>
              Sign in to your account
            </h2>
            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Enter your credentials to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '1.5rem', padding: '1rem 1.25rem',
              borderRadius: '16px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'rgba(148,163,184,0.9)', marginBottom: '0.5rem', letterSpacing: '0.04em',
              }}>
                EMAIL ADDRESS
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@codegnan.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '14px', padding: '0.9rem 1.1rem',
                  color: '#ffffff', fontSize: '0.95rem',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'rgba(148,163,184,0.9)', marginBottom: '0.5rem', letterSpacing: '0.04em',
              }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '14px', padding: '0.9rem 1.1rem',
                    paddingRight: '3rem', // make room for the icon
                    color: '#ffffff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(148,163,184,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.6)'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.75rem',
                width: '100%', padding: '1rem',
                background: loading
                  ? 'rgba(59,130,246,0.5)'
                  : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                border: 'none', borderRadius: '14px',
                color: '#ffffff', fontSize: '1rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 30px rgba(59,130,246,0.35)',
                transition: 'all 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.boxShadow = '0 0 40px rgba(59,130,246,0.55)'; e.target.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.target.style.boxShadow = '0 0 30px rgba(59,130,246,0.35)'; e.target.style.transform = 'none'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }} />
                  Authenticating...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{
            marginTop: '2rem', textAlign: 'center',
            color: 'rgba(100,116,139,0.7)', fontSize: '0.8rem',
          }}>
            © 2025 Codegnan. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="flex: 1"] { flex: unset !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
