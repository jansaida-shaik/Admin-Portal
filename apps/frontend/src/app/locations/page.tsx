'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LocationsDirectory() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocations() {
      try {
        const res = await fetchApi('/locations?limit=100');
        setLocations(res.data || res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Location Registry</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Manage organizational operating zones and physical campuses.</p>
        </div>
        
        <Link href="/locations/new" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, var(--accent-orange), #ff6b00)',
          color: '#fff', textDecoration: 'none',
          padding: '12px 24px', borderRadius: '12px',
          fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em',
          boxShadow: '0 10px 20px rgba(245,130,32,0.2)',
          transition: 'all 0.2s ease', border: 'none', cursor: 'pointer'
        }}>
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Register Hub
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-sub)' }}>
          Syncing geolocation ledger...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {locations.map((loc: any) => (
            <div key={loc.id} className="glass-card" style={{
              padding: '24px', borderRadius: '20px', border: '1px solid var(--border-main)',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(245,130,32,0.1)', color: 'var(--accent-orange)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-head)' }}>{loc.name}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-sub)' }}>{loc.city || 'Global'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
