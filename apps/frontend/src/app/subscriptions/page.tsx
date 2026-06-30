'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { usePaginatedData } from '@/lib/usePaginatedData';
import Pagination from '@/components/Pagination';
import dynamic from 'next/dynamic';
import { CITY_FILTER_OPTIONS, CITY_COLOR } from '@/lib/locations';
import ExportButton from '@/components/ExportButton';

const SearchableSelect = dynamic(() => import('@/components/SearchableSelect'), {
  loading: () => <div style={{ height: '42px', width: '100%', background: 'var(--bg-input)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
});

export default function SubscriptionsDirectory() {
  const {
    data: subscriptions,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    total,
    totalPages,
    search,
    setSearch
  } = usePaginatedData('/subscriptions');

  const [freqFilter, setFreqFilter] = useState('ALL');
  const [locFilter, setLocFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RENEWAL_ASC');

  // Stats State
  const [aggStats, setAggStats] = useState({ totalMonthlyCost: 0, upcomingRenewals: 0, loading: true });

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await fetchApi('/subscriptions?limit=1000');
        const allSubs = res.data || [];
        
        let costSum = 0;
        let upcomingCount = 0;
        const today = new Date();
        
        allSubs.forEach((s: any) => {
          costSum += (Number(s.cost) || 0);
          const renewal = new Date(s.renewalDate);
          const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0 && diffDays <= 30) upcomingCount++;
        });

        setAggStats({ totalMonthlyCost: costSum, upcomingRenewals: upcomingCount, loading: false });
      } catch (e) {
        console.error('Subscription telemetry error:', e.message);
      }
    }
    fetchTelemetry();
  }, [total]);

  const filtered = subscriptions.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesFreq = freqFilter === 'ALL' || s.billingFrequency === freqFilter;
    const matchesLoc = locFilter === 'ALL' || (s.location?.name && s.location.name.includes(locFilter)) || (s.locationId && s.locationId.toString() === locFilter);
    return matchesSearch && matchesFreq && matchesLoc;
  }).sort((a, b) => {
    if (sortBy === 'RENEWAL_ASC') return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
    if (sortBy === 'RENEWAL_DESC') return new Date(b.renewalDate).getTime() - new Date(a.renewalDate).getTime();
    if (sortBy === 'COST_DESC') return b.cost - a.cost;
    if (sortBy === 'COST_ASC') return a.cost - b.cost;
    return 0;
  });

  const getDaysUntilRenewal = (dateString: string) => {
    const diffTime = new Date(dateString).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0, letterSpacing: '-0.02em'
          }}>Subscriptions</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Manage recurring software licenses and cloud services.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ExportButton 
            data={filtered} 
            filename="Subscriptions_Report" 
            headers={[
              { key: 'name', label: 'Subscription' },
              { key: 'vendor', label: 'Vendor' },
              { key: 'plan', label: 'Plan' },
              { key: 'billingCycle', label: 'Cycle' },
              { key: 'cost', label: 'Cost' },
              { key: 'location.name', label: 'Branch' }
            ]} 
          />
          <Link href="/subscriptions/new" style={{
            background: 'linear-gradient(135deg, #F58220, #245fb4)', color: '#fff', padding: '10px 18px',
            borderRadius: '14px', fontWeight: 600, fontSize: '13px', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(255, 90, 31, 0.2)', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center'
          }}>
            + Add Subscription
          </Link>
        </div>
      </div>

      {/* 📊 Analytics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE SUBSCRIPTIONS', val: total, sub: 'Total registered services', col: '#245fb4' },
          { label: 'TOTAL COST SPEND', val: aggStats.loading ? '...' : `₹${aggStats.totalMonthlyCost.toLocaleString()}`, sub: 'Aggregated expenses', col: '#10b981' },
          { label: 'RENEWING THIS MONTH', val: aggStats.loading ? '...' : aggStats.upcomingRenewals, sub: 'Due in next 30 days', col: '#ef4444' },
          { label: 'AUTO-RENEW ENABLED', val: aggStats.loading ? '...' : `${Math.round((subscriptions.filter(s=>s.autoRenew).length / Math.max(1, subscriptions.length)) * 100)}%`, sub: 'Of listed services', col: '#F58220' }
        ].map((m, idx) => (
          <div key={idx} className="glass-card" style={{
            padding: '18px 20px', borderRadius: '20px', display: 'flex', flexDirection: 'column',
            gap: '4px', borderLeft: `4px solid ${m.col}`, transition: 'all 0.2s ease'
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
          placeholder="Search Subscriptions"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            width: '220px', height: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
            borderRadius: '14px', padding: '0 16px', color: 'var(--text-head)', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        
        <SearchableSelect 
          value={freqFilter} 
          onChange={(e) => setFreqFilter(e.target.value)} 
          placeholder="Billing Cycle"
          options={[
            { value: 'ALL', label: 'All Cycles' },
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'QUARTERLY', label: 'Quarterly' },
            { value: 'HALF_YEARLY', label: 'Half-Yearly' },
            { value: 'YEARLY', label: 'Yearly' }
          ]}
        />

        <SearchableSelect 
          value={locFilter} 
          onChange={(e) => setLocFilter(e.target.value)} 
          placeholder="All Branches"
          options={CITY_FILTER_OPTIONS}
          renderOption={(opt: any, isSelected: boolean) => {
            const dotColor = CITY_COLOR[opt.value] || 'transparent';
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {opt.value !== 'ALL' && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                )}
                <span style={{ color: isSelected ? '#fff' : 'inherit' }}>{opt.label}</span>
              </div>
            );
          }}
        />

        <SearchableSelect 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          placeholder="Sort Order"
          options={[
            { value: 'RENEWAL_ASC', label: 'Renewal (Soonest)' },
            { value: 'RENEWAL_DESC', label: 'Renewal (Latest)' },
            { value: 'COST_DESC', label: 'Cost (High)' },
            { value: 'COST_ASC', label: 'Cost (Low)' }
          ]}
        />

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>
          Displaying <span style={{ color: 'var(--text-head)' }}>{filtered.length}</span> of {total}
        </div>
      </div>

      {error ? (
        <div style={{ color: 'red' }}>Error: {error}</div>
      ) : loading ? (
        <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '40px' }}>Loading subscriptions...</div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Subscription</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Vendor</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Branch</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Cost</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Cycle</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Renewal Date</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-sub)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>No subscriptions found.</td></tr>
              ) : (
                filtered.map((sub: any) => {
                  const days = getDaysUntilRenewal(sub.renewalDate);
                  let statusColor = '#10b981';
                  let statusText = 'Active';
                  if (days < 0) { statusColor = '#ef4444'; statusText = 'Expired'; }
                  else if (days <= 15) { statusColor = '#f59e0b'; statusText = 'Renewing Soon'; }
                  else if (sub.status !== 'ACTIVE') { statusColor = '#6b7280'; statusText = sub.status; }

                  return (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                      <td style={{ padding: '16px 24px', color: 'var(--text-head)', fontWeight: 600 }}>{sub.name}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)' }}>{sub.vendor}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)' }}>{sub.location?.name || 'Global'}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-head)' }}>₹{sub.cost.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-sub)' }}>{sub.billingFrequency}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-head)' }}>{new Date(sub.renewalDate).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                          background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}40`
                        }}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination 
        page={page} limit={limit} totalPages={totalPages} total={total} 
        setPage={setPage} setLimit={setLimit} 
      />
    </div>
  );
}
