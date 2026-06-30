'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend
} from 'recharts';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const m = await fetchApi('/reports/metrics');
        const c = await fetchApi('/reports/charts');
        setMetrics(m);
        setCharts(c);
      } catch (e) {
        console.error('Failed to load reports', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--text-sub)' }}>Generating Analytics...</div>;
  }

  if (!metrics || !charts) {
    return <div style={{ color: 'red', padding: '24px' }}>Failed to load analytics data.</div>;
  }

  const COLORS = ['#F58220', '#245fb4', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      <div>
        <h1 style={{
          fontSize: '28px', fontWeight: 800,
          background: 'linear-gradient(135deg, var(--text-head) 30%, #F58220 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: 0, letterSpacing: '-0.02em'
        }}>Global Analytics</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '4px' }}>Executive dashboard and centralized reporting metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE PERSONNEL', val: metrics.activeEmployees, sub: 'Total workforce', col: '#245fb4' },
          { label: 'MONTHLY PAYROLL EST.', val: `₹${metrics.totalMonthlySalary.toLocaleString()}`, sub: 'Estimated outflow', col: '#10b981' },
          { label: 'MONTHLY SUBSCRIPTIONS', val: `₹${metrics.totalMonthlyCost.toLocaleString()}`, sub: 'Software & SaaS costs', col: '#ef4444' },
          { label: 'ASSETS VALUATION', val: `₹${metrics.totalAssetsValue.toLocaleString()}`, sub: 'Total capital logged', col: '#F58220' }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Headcount by Branch */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--text-head)' }}>Workforce Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.employeesByBranch} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-sub)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-sub)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {charts.employeesByBranch.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets by Category */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--text-head)' }}>Asset Categories</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.assetsByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {charts.assetsByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-sub)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* SaaS Spend by Vendor */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--text-head)' }}>Top 5 SaaS Subscriptions by Cost (Monthly)</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.spendByVendor} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: 'var(--text-sub)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-sub)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="spend" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
}
