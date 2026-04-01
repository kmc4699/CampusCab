import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  
  useEffect(() => {
    const prev = {
      bodyMargin: document.body.style.margin,
      bodyPadding: document.body.style.padding,
      bodyOverflow: document.body.style.overflowX,
      htmlMargin: document.documentElement.style.margin,
      htmlPadding: document.documentElement.style.padding,
    };
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    return () => {
      document.body.style.margin = prev.bodyMargin;
      document.body.style.padding = prev.bodyPadding;
      document.body.style.overflowX = prev.bodyOverflow;
      document.documentElement.style.margin = prev.htmlMargin;
      document.documentElement.style.padding = prev.htmlPadding;
    };
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setMessage('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (mode === 'register') {
      // USER STORY 1, TEST 1: Validate .ac.nz email
      if (!email.endsWith('.ac.nz')) {
        setMessage("Validation error: You must use a valid university .ac.nz email address.");
        return;
      }
      try {
        // USER STORY 1, TEST 2: Create account
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Success! Account created. You can now log in.");
        switchMode('login');
      } catch (error) {
        setMessage("Error: " + error.message);
      }
    } else {
      try {
        // USER STORY 2, TEST 2: Secure login
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      } catch (error) {
        // USER STORY 2, TEST 1: Invalid login alert
        setMessage("Invalid Login. Please check your email and password.");
      }
    }
  };

  const isError = message.toLowerCase().includes('error') || message.toLowerCase().includes('invalid');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,                  // top/right/bottom/left: 0 — covers the full viewport
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)',
      overflowY: 'auto',
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '64px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div
          onClick={() => switchMode('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px', height: '38px',
            backgroundColor: '#2563eb',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
              viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h10l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4 0a2 2 0 11-4 0m4 0a2 2 0 01-4 0" />
            </svg>
          </div>
          <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#0f172a' }}>Campus Cab</span>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => switchMode('login')}
            style={{
              padding: '8px 22px',
              border: '2px solid #2563eb',
              backgroundColor: mode === 'login' ? '#2563eb' : 'transparent',
              color: mode === 'login' ? '#fff' : '#2563eb',
              borderRadius: '8px',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
          <button
            onClick={() => switchMode('register')}
            style={{
              padding: '8px 22px',
              border: '2px solid #2563eb',
              backgroundColor: mode === 'register' ? '#2563eb' : 'transparent',
              color: mode === 'register' ? '#fff' : '#2563eb',
              borderRadius: '8px',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT — fills remaining space, full blue ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '4rem 1.5rem',
      }}>

        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          background: 'rgba(255,255,255,0.07)', borderRadius: '50%',
          top: '-90px', right: '6%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '280px', height: '280px',
          background: 'rgba(96,165,250,0.15)', borderRadius: '50%',
          bottom: '-60px', left: '5%', filter: 'blur(50px)', pointerEvents: 'none',
        }} />

        {/* ── HOME CONTENT ── */}
        {mode === 'home' && (
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff', maxWidth: '640px' }}>
            <h1 style={{
              fontSize: 'clamp(1.9rem, 4.5vw, 2.9rem)',
              fontWeight: '900',
              lineHeight: '1.15',
              marginBottom: '1rem',
            }}>
              Get Around Campus
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.72)' }}>
                With Fellow Students
              </span>
            </h1>
            <p style={{
              fontSize: '1.05rem',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.65',
              maxWidth: '500px',
              margin: '0 auto 2.2rem',
            }}>
              Safe, affordable rides within your campus community. Students helping students get where they need to go.
            </p>
            <button
              onClick={() => switchMode('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                backgroundColor: '#fff',
                color: '#2563eb',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.22)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.18)'; }}
            >
              Offer a Ride
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        )}

        {/* ── LOGIN / REGISTER CARD ── */}
        {(mode === 'login' || mode === 'register') && (
          <div style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '44px 40px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>
              {mode === 'register' ? "CampusCab Registration" : "CampusCab Login"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <input
                  type="email"
                  placeholder="Enter university email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '0.95rem',
                    border: `1.5px solid ${emailFocus ? '#2563eb' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#334155',
                    boxShadow: emailFocus ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '0.95rem',
                    border: `1.5px solid ${passFocus ? '#2563eb' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#334155',
                    boxShadow: passFocus ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '130px',
                  padding: '11px 0',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                {mode === 'register' ? "Register" : "Login"}
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                style={{
                  background: 'none', border: 'none',
                  color: '#2563eb', textDecoration: 'underline',
                  cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
                }}
              >
                {mode === 'register'
                  ? "Already have an account? Log in here."
                  : "Need an account? Register here."}
              </button>
            </div>

            {message && (
              <p style={{
                marginTop: '16px',
                fontSize: '0.88rem',
                fontWeight: '700',
                borderRadius: '6px',
                padding: '8px 12px',
                color: isError ? '#dc2626' : '#16a34a',
                backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
              }}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>

      
    </div>
  );
}

export default Login;