'use client';
import { use } from 'react';
import Link from 'next/link';
import DataFetcher from '@/components/DataFetcher';

export default function VendorProfile({ params }) {
  const resolvedParams = use(params);
  const vendorId = (resolvedParams as any).id;

  return (
    <DataFetcher
      url={`/vendors/${vendorId}`}
      loadingElement={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-sub)', fontWeight: 600, fontSize: '14px' }}>
          Synchronizing partner supply network telemetry...
        </div>
      }
      errorElement={(error) => (
        <div style={{ padding: '32px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', color: '#ef4444' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>⚠️ Logistics Profile Load Error</h3>
          <p style={{ margin: '12px 0 24px 0', fontSize: '14px', opacity: 0.8 }}>{error}</p>
          <Link href="/vendors" style={{ display: 'inline-block', background: '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}>
            ← Back to Vendor Hub
          </Link>
        </div>
      )}
      render={(vendor) => {
        if (!vendor) return <div style={{ padding: '40px', color: 'var(--text-sub)' }}>Vendor node not registered in central index.</div>;

        return (
          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      <div>
        <Link href="/vendors" style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          fontSize: '14px', fontWeight: 700, color: '#F58220', textDecoration: 'none',
          transition:'transform 0.2s'
        }} onMouseEnter={e=>e.currentTarget.style.transform='translateX(-4px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
          ← Back to Vendor Directory
        </Link>
      </div>

      {/* Profile Banner Profile Header */}
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
        {/* Ambient Glow */}
        <div style={{ position:'absolute', width:'150px', height:'150px', background:'rgba(245, 130, 32, 0.15)', borderRadius:'50%', filter:'blur(50px)', top:'-50px', right:'-50px', zIndex:0 }} />

        <div style={{
          width: '84px', height: '84px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #F58220, #245fb4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '36px', flexShrink: 0,
          boxShadow: '0 8px 24px rgba(245,130,32,0.25)',
          zIndex: 1
        }}>
          {vendor.name.charAt(0)}
        </div>

        <div style={{ flexGrow: 1, minWidth: '250px', zIndex:1 }}>
          <h1 style={{ 
            fontSize: '32px', fontWeight: 900, color: 'var(--text-head)', 
            margin: 0, letterSpacing: '-0.02em' 
          }}>
            {vendor.name}
          </h1>
          <div style={{ 
            display: 'inline-flex', alignItems:'center', gap:'6px', marginTop: '10px', background: 'var(--bg-input)', 
            border: '1px solid var(--border-main)', padding: '5px 12px', borderRadius: '10px',
            fontSize: '12px', color: 'var(--text-sub)', fontWeight:700, fontFamily:'monospace' 
          }}>
            NODE_ID: #{vendor.id.toString().slice(-8)}
          </div>
        </div>

        {/* Contact Segment Grid Card */}
        <div className="glass-card" style={{ 
          background: 'var(--bg-input)', border: '1px solid var(--border-main)',
          borderRadius: '20px', padding: '20px 28px', minWidth: '260px', zIndex: 1 
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Logistics Representative
          </div>
          <div style={{ fontSize: '16px', fontWeight: 850, color: 'var(--text-head)', marginTop: '6px', wordBreak:'break-all' }}>
            {vendor.contact || 'Anonymous Provider Profile'}
          </div>
        </div>
      </div>

      {/* Main Supply Roster Segment */}
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 850, color: 'var(--text-head)', margin: 0, letterSpacing:'-0.01em' }}>
            📦 Sourced Logistics Inventory
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px', fontWeight:600 }}>
            Immutable hardware items and dynamic catalog nodes provisioned through this channel.
          </p>
        </div>

        {vendor.items && vendor.items.length > 0 ? (
          <div className="glass-card" style={{ 
            background: 'var(--bg-panel)', border: '1px solid var(--border-main)', 
            borderRadius: '24px', overflow: 'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-main)' }}>
                    <th style={{ padding: '20px 28px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '11px', letterSpacing:'0.05em' }}>Physical Asset Line</th>
                    <th style={{ padding: '20px 28px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '11px', letterSpacing:'0.05em' }}>Operational Class</th>
                    <th style={{ padding: '20px 28px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '11px', letterSpacing:'0.05em' }}>Creation Epoch</th>
                    <th style={{ padding: '20px 28px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', fontSize: '11px', letterSpacing:'0.05em', textAlign: 'right' }}>Action Vector</th>
                  </tr>
                </thead>
                <tbody>
                  {vendor.items.map(item => (
                    <tr key={item.id.toString()} style={{ borderBottom: '1px solid var(--border-main)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '20px 28px', fontWeight: 800, color: 'var(--text-head)', fontSize:'15px' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '20px 28px' }}>
                        <span style={{ 
                          background: 'rgba(245, 130, 32, 0.12)', color: '#F58220', border:'1px solid rgba(245,130,32,0.25)',
                          padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform:'uppercase', letterSpacing:'0.03em'
                        }}>
                          {item.category?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 28px', color: 'var(--text-sub)', fontWeight:600 }}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '20px 28px', textAlign: 'right' }}>
                        <Link href={`/assets/${item.id}`} style={{
                          background: 'var(--bg-input)', border: '1px solid var(--border-main)',
                          color: 'var(--text-head)', borderRadius: '12px', padding: '8px 16px', 
                          fontSize: '12px', fontWeight: 700, textDecoration: 'none', cursor: 'pointer',
                          display: 'inline-flex', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#F58220'; (e.target as HTMLElement).style.color = '#fff'; (e.target as HTMLElement).style.borderColor='transparent'; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'var(--bg-input)'; (e.target as HTMLElement).style.color = 'var(--text-head)'; (e.target as HTMLElement).style.borderColor='var(--border-main)'; }}
                        >
                          View Detail Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '56px 24px', background: 'var(--bg-input)', border: '1px dashed var(--border-main)', 
            borderRadius: '24px', textAlign: 'center', color: 'var(--text-sub)' 
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
            <div style={{ fontWeight: 800, color:'var(--text-head)', fontSize:'16px' }}>No Active Supply Feeds</div>
            <div style={{ fontSize: '13px', marginTop: '6px', maxWidth:'300px', margin:'6px auto 0 auto', opacity:0.8, fontWeight:500 }}>This partner entity has not logged inventory procurement cycles in the central ledger.</div>
          </div>
        )}
      </div>
    </div>
        );
      }}
    />
  );
}
