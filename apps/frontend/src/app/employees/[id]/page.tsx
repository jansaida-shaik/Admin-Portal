'use client';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import CarrierLogo from '@/components/mobile/CarrierLogo';
import { formatMobileNumber, normalizeMobileProvider } from '@/lib/mobileProviders';

export default function EmployeeAssets({ params }) {
  const resolvedParams = use(params);
  const employeeId = resolvedParams.id;
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchApi(`/users/${employeeId}`);
        setEmployee(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-sub)', fontWeight:600, fontSize:'14px' }}>Retrieving staff file custody audits...</div>;
  
  if (error || !employee) {
    return (
      <div style={{ padding: '32px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', color: '#ef4444' }}>
        <h3 style={{ margin: 0, fontSize:'20px', fontWeight:800 }}>⚠️ Staff Profile Retrieval Failure</h3>
        <p style={{ margin: '12px 0 24px 0', fontSize: '14px', opacity:0.8 }}>{error || 'Selected personnel node does not exist in the directory.'}</p>
        <Link href="/employees" style={{ display: 'inline-block', background:'#ef4444', color: '#fff', padding:'10px 20px', borderRadius:'12px', fontWeight:700, textDecoration: 'none', fontSize:'13px' }}>
          ← Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding:'24px' }}>
      
      {/* Breadcrumbs & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/employees" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          fontSize: '14px', fontWeight: 700, color: '#F58220', textDecoration: 'none',
          transition:'transform 0.2s'
        }} onMouseEnter={e=>e.currentTarget.style.transform='translateX(-4px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
           ← Back to Directory
        </Link>
        <Link href="/assets/new" style={{
          background: 'linear-gradient(135deg, #F58220, #245fb4)', 
          color: '#fff', 
          padding: '10px 20px', 
          borderRadius: '14px',
          fontWeight: 750, 
          fontSize: '13px', 
          textDecoration: 'none', 
          boxShadow: '0 8px 20px rgba(245,130,32,0.25)',
          transition: 'transform 0.2s'
        }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
          + Assign New Asset
        </Link>
      </div>

      {/* Personnel Identity Glassmorphic Card Header */}
      <div className="glass-card" style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-main)',
        borderRadius: '28px',
        padding: '40px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '32px',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Background radial blur node */}
        <div style={{ position:'absolute', width:'150px', height:'150px', background:'rgba(245, 130, 32, 0.15)', borderRadius:'50%', filter:'blur(50px)', top:'-50px', right:'-50px', zIndex:0 }} />

        <div style={{
          width: '84px', height: '84px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #F58220, #245fb4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '32px', flexShrink: 0,
          boxShadow: '0 8px 24px rgba(245,130,32,0.25)',
          zIndex: 1
        }}>
          {employee.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flexGrow: 1, zIndex:1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', margin: 0, letterSpacing:'-0.02em' }}>{employee.name}</h1>
            <span style={{ 
              background: 'var(--bg-input)', border: '1px solid var(--border-main)', 
              color: 'var(--text-sub)', padding: '4px 10px', borderRadius: '8px', 
              fontSize: '11px', fontWeight: 800, letterSpacing:'0.05em' 
            }}>
              {employee.role}
            </span>
          </div>
          <div style={{ fontSize: '15px', color: 'var(--text-sub)', marginTop: '8px', fontWeight:600, display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            {(() => {
              const isPhoneEmail = employee.email?.match(/^(\d{10,})@codegnan\.com$/i);
              const phone = isPhoneEmail ? isPhoneEmail[1] : (employee.phone || null);
              const displayEmail = isPhoneEmail ? '' : employee.email;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {displayEmail && <span>✉️ {displayEmail}</span>}
                  {displayEmail && phone && <span style={{opacity:0.4}}>•</span>}
                  {phone && <span>📞 {phone}</span>}
                </div>
              );
            })()}
            <span style={{opacity:0.4}}>•</span>
            <span>📍 <strong style={{color:'var(--text-head)'}}>Location:</strong> {employee.city || employee.loc || 'Global'}</span>
            <span style={{opacity:0.4}}>•</span>
            <span><strong style={{color:'var(--text-head)'}}>Branch:</strong> {employee.branch || employee.location || 'Main Office'}</span>
          </div>
        </div>
      </div>

      {/* Assigned Cellular Vectors Grid Matrix */}
      <div className="glass-card" style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-main)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-main)', background: 'var(--bg-input)', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{fontSize:'18px'}}>📱</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-head)' }}>Assigned Mobile Lines ({employee.mobileNumbers?.length || 0})</h2>
        </div>
        {!employee.mobileNumbers || employee.mobileNumbers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-sub)' }}>
            <p style={{margin:0, fontWeight:600, fontSize:'14px'}}>No dynamic cellular lines provisioned for this account.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
              padding: '16px 28px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-main)',
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)'
            }}>
              <div>Mobile Vector</div>
              <div>Status</div>
              <div>Carrier Provider</div>
            </div>
            {employee.mobileNumbers.map(n => (
              <div key={n.id.toString()} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr',
                padding: '20px 28px', borderBottom: '1px solid var(--border-main)',
                alignItems: 'center', fontSize: '14px', color: 'var(--text-head)',
                transition:'background 0.2s'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-input)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CarrierLogo provider={n.provider} size={28} />
                  <div style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '16px', letterSpacing: '1px' }}>
                    {formatMobileNumber(n.number)}
                  </div>
                </div>
                <div>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: 'rgba(16,185,129,0.12)', color: '#10b981', border:'1px solid rgba(16,185,129,0.2)' }}>
                    {n.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-sub)', fontWeight: 700 }}>{normalizeMobileProvider(n.provider) || 'Airtel'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IT Custody Operations Table Container */}
      <div className="glass-card" style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-main)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-main)', background: 'var(--bg-input)', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{fontSize:'18px'}}>💻</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-head)' }}>Deployed Corporate IT Assets ({employee.assignments?.length || 0})</h2>
        </div>

        {!employee.assignments || employee.assignments.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-sub)' }}>
            <p style={{margin:0, fontWeight:600, fontSize:'14px'}}>No physical hardware assets registered under this personnel ledger.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 120px',
              padding: '16px 28px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-main)',
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-sub)'
            }}>
              <div>Asset Identification</div>
              <div>Class</div>
              <div>Location Matrix</div>
              <div>Assigned On</div>
              <div style={{ textAlign: 'center' }}>Audit Action</div>
            </div>

            {employee.assignments.map(a => (
              <div key={a.id.toString()} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 120px',
                padding: '20px 28px', borderBottom: '1px solid var(--border-main)',
                alignItems: 'center', fontSize: '14px', color: 'var(--text-head)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontWeight: 800, fontSize:'15px' }}>
                  {a.item?.name || 'Legacy Asset Node'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F58220' }}></div>
                  <span style={{ color: 'var(--text-sub)', fontWeight: 700 }}>{a.item?.category?.name || 'General'}</span>
                </div>

                <div style={{ color: 'var(--text-sub)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize:'13px' }}>
                  📍 Loc: {a.location?.city || 'Global'} • Branch: {a.location?.name || 'Main'}
                </div>

                <div style={{ color: 'var(--text-sub)', fontWeight: 600, fontSize: '13px' }}>
                  {new Date(a.assignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => alert(`Registering return ledger process for assignment node: ${a.id}`)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.15)', padding: '6px 12px', borderRadius: '10px',
                      fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                      transition: 'all 0.2s', textTransform:'uppercase', letterSpacing:'0.03em'
                    }}
                    onMouseEnter={(e) => {e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color='#fff';}}
                    onMouseLeave={(e) => {e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color='#ef4444';}}
                  >
                    Retire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
