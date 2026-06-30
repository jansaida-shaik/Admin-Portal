'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, FileText, CheckCircle, XCircle, DollarSign, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    basicSalary: 0,
    allowances: 0,
    deductions: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payrollData, usersData] = await Promise.all([
        fetchApi('/housekeeping/payroll'),
        fetchApi('/users?limit=1000')
      ]);
      setPayrolls(payrollData || []);
      setUsers(usersData?.data || []);
    } catch (e) {
      console.error('Failed to fetch payroll', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/housekeeping/payroll/generate', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchData();
      toast.success('Payslip generated successfully');
    } catch (error: any) {
      console.error('Error generating payslip:', error);
      toast.error('Failed to generate payslip');
    }
  };

  const markPaid = async (id: string) => {
    if(!confirm('Mark this payslip as PAID?')) return;
    try {
      await fetchApi(`/housekeeping/payroll/${id}/pay`, { method: 'PUT' });
      toast.success('Payslip marked as paid');
      fetchData();
    } catch (e) {
      toast.error('Failed to process payment');
    }
  };

  const filtered = payrolls.filter(p => (p.user?.name || '').toLowerCase().includes(search.toLowerCase()) || p.month.includes(search));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Payroll Management</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Generate and track staff payslips securely.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportButton data={payrolls} filename="payroll.csv" />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: 'var(--brand-primary)', color: 'white',
              border: 'none', padding: '0 20px', borderRadius: '8px',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {showAddForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showAddForm ? 'Cancel' : 'Generate Payslip'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Generate New Payslip</h2>
          <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</label>
              <select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department || 'General'}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Month</label>
              <input type="month" required value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Basic Salary ($)</label>
              <input type="number" step="0.01" required value={formData.basicSalary} onChange={(e) => setFormData({...formData, basicSalary: Number(e.target.value)})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Allowances ($)</label>
              <input type="number" step="0.01" value={formData.allowances} onChange={(e) => setFormData({...formData, allowances: Number(e.target.value)})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Deductions ($)</label>
              <input type="number" step="0.01" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Generate Payslip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Standard Table Interface */}
      <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-main)', display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
            <input
              type="text"
              placeholder="Search by employee name or month..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-body)', border: '1px solid var(--border-main)', padding: '10px 16px 10px 44px', borderRadius: '8px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading payroll...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Period</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Net Pay</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payroll) => (
                <tr key={payroll.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                        <UserIcon size={18} />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>
                        {payroll.user?.name || `ID: ${payroll.userId}`}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-head)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--text-sub)" /> {payroll.month}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: 'var(--text-head)', fontWeight: 700 }}>
                      <DollarSign size={16} color="#10b981" /> {payroll.netPay.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>
                      Base: ${payroll.basicSalary} | Allw: ${payroll.allowances} | Ded: ${payroll.deductions}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {payroll.status === 'PAID' ? (
                      <span style={{ background: '#10b98115', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                        PAID on {new Date(payroll.paymentDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{ background: '#f59e0b15', color: '#f59e0b', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                        PENDING
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {payroll.status === 'PENDING' && (
                      <button onClick={() => markPaid(payroll.id)} style={{ background: '#10b98120', color: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No payslips found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
