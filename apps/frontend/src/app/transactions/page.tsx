'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const result = await fetchApi('/transactions');
        setTransactions(result.data || result || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  // Metrics Computations
  const counts = {
    total: transactions.length,
    in: transactions.filter(t => t.type === 'IN').length,
    out: transactions.filter(t => t.type === 'OUT').length,
    transfer: transactions.filter(t => t.type === 'TRANSFER').length,
  };

  // Client-side filtering
  const filtered = transactions.filter(t => {
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const itemName = t.item?.name?.toLowerCase() || '';
    const matchesSearch = searchQuery === '' || itemName.includes(searchQuery.toLowerCase()) || 
      t.id.toString().includes(searchQuery) ||
      (t.sentBy?.name && t.sentBy.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.receivedBy?.name && t.receivedBy.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '100px 120px 1fr 90px 120px 120px 160px',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-main)',
    color: 'var(--text-head)',
    fontSize: '13px',
    transition: 'background 0.2s',
  };

  const getBadgeStyle = (type) => {
    if (type === 'IN') return { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)' };
    if (type === 'OUT') return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' };
    return { bg: 'rgba(36,95,180,0.12)', text: '#245fb4', border: 'rgba(36,95,180,0.2)' };
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          letterSpacing: '-0.02em'
        }}>Audit History</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Immutable real-time ledger of catalog lifecycle operations.</p>
      </div>

      {/* 📊 Global Log Action Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'TOTAL AUDITS', val: loading ? '...' : counts.total, sub: 'Registered events in ledger', col: '#F58220' },
          { label: 'INBOUND FLOWS', val: loading ? '...' : counts.in, sub: 'Stock addition manifests', col: '#10b981' },
          { label: 'OUTBOUND FLOWS', val: loading ? '...' : counts.out, sub: 'Units pulled or decommissioned', col: '#ef4444' },
          { label: 'ROUTED TRANSFERS', val: loading ? '...' : counts.transfer, sub: 'Inter-branch stock shuffles', col: '#245fb4' }
        ].map((m, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '18px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: `4px solid ${m.col}`,
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-sub)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{m.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-head)', margin: '2px 0' }}>{m.val}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 500 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="responsive-filter-bar" style={{ display: 'flex', gap: '12px', height: '42px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search ledger description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '280px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        
        <SearchableSelect 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="All Action Types"
          options={[
            { value: 'ALL', label: 'All Action Types' },
            { value: 'IN', label: 'IN (Entry)' },
            { value: 'OUT', label: 'OUT (Exit)' },
            { value: 'TRANSFER', label: 'TRANSFER (Routing)' }
          ]}
        />

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Records Loaded: <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span>
        </div>
      </div>

      {error ? (
        <div style={{ color: '#ef4444', padding: '24px', background: 'rgba(239, 68, 68, 0.1)', borderRadius:'16px', border:'1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ Operational ledger failure: {error}
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '48px' }}>Syncing ledger telemetry stream...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '48px', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-main)' }}>
          No matching log transactions found.
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-main)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '100px 120px 1fr 90px 120px 120px 160px',
            background: 'rgba(255,255,255,0.02)',
            padding: '14px 24px',
            borderBottom: '1px solid var(--border-main)',
            color: 'var(--text-sub)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            <div>ID</div>
            <div>Type</div>
            <div>Item Details</div>
            <div>Qty</div>
            <div>Sender</div>
            <div>Receiver</div>
            <div>Timestamp</div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filtered.map((t) => {
              const badge = getBadgeStyle(t.type);
              const tDate = t.transactionDate ? new Date(t.transactionDate) : new Date(t.createdAt);
              return (
                <div 
                  key={t.id.toString()} 
                  style={rowStyle}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: 'var(--text-sub)', fontWeight: 700, fontFamily:'monospace', fontSize: '12px' }}>
                    #{t.id.toString().slice(-6)}
                  </div>
                  <div>
                    <span style={{
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800,
                      display: 'inline-block', textAlign: 'center', minWidth: '64px',
                    }}>{t.type}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-head)' }}>{t.item?.name || 'Unlinked Catalog Item'}</div>
                    <div style={{ fontSize:'11px', color:'var(--text-sub)', marginTop:'2px' }}>
                      {t.type === 'IN' && `→ Recvd at ${t.toLocation?.name || 'Branch'}`}
                      {t.type === 'OUT' && `← Released from ${t.fromLocation?.name || 'Branch'}`}
                      {t.type === 'TRANSFER' && `${t.fromLocation?.name || 'Src'} → ${t.toLocation?.name || 'Dst'}`}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-head)', fontWeight: 800, fontSize:'14px' }}>{t.quantity}</div>
                  <div style={{ color: 'var(--text-head)', fontWeight: 600 }}>{t.sentBy?.name || '-'}</div>
                  <div style={{ color: 'var(--text-head)', fontWeight: 600 }}>{t.receivedBy?.name || '-'}</div>
                  <div style={{ color: 'var(--text-sub)', fontSize: '12px', fontWeight: 500 }}>
                    {tDate.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
