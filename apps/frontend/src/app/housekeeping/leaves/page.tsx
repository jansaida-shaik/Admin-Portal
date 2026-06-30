'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, User as UserIcon, XCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [quota, setQuota] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'CASUAL'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesData, usersData, quotaData] = await Promise.all([
        fetchApi('/housekeeping/leaves?limit=1000'),
        fetchApi('/users?limit=1000'),
        fetchApi('/housekeeping/leaves/quota')
      ]);
      setLeaves(leavesData || []);
      setUsers(usersData?.data || []);
      setQuota(quotaData || null);
    } catch (e) {
      console.error('Failed to fetch leaves', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/housekeeping/leaves', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchData();
      toast.success('Leave requested successfully');
    } catch (error) {
      console.error('Error requesting leave:', error);
      toast.error('Failed to request leave.');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/housekeeping/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update leave status');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return { bg: '#10b98115', text: '#10b981' };
      case 'REJECTED': return { bg: '#ef444415', text: '#ef4444' };
      case 'PENDING': return { bg: '#f59e0b15', text: '#f59e0b' };
      default: return { bg: 'var(--bg-panel)', text: 'var(--text-sub)' };
    }
  };

  const filtered = leaves.filter(l => (l.user?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Leave Directory</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Manage workforce leave requests and quotas.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportButton data={leaves} filename="leaves.csv" />
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
            {showAddForm ? 'Cancel' : 'Request Leave'}
          </button>
        </div>
      </div>

      {quota && !showAddForm && (
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>Sick Leaves Left</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)' }}>{quota.sickLeave}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>Casual Leaves Left</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)' }}>{quota.casualLeave}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>Earned Leaves Left</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)' }}>{quota.earnedLeave}</div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Request Leave</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</label>
              <select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department || 'General'}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Leave Type</label>
              <select required value={formData.leaveType} onChange={(e) => setFormData({...formData, leaveType: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="EARNED">Earned Leave</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Start Date</label>
              <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>End Date</label>
              <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Reason</label>
              <input type="text" required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} placeholder="Why are you requesting leave?" />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Submit Request
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
              placeholder="Search by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-body)', border: '1px solid var(--border-main)', padding: '10px 16px 10px 44px', borderRadius: '8px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading records...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Dates</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Reason</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((leave) => {
                const sColor = getStatusColor(leave.status);
                return (
                  <tr key={leave.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>{leave.user?.name || `ID: ${leave.userId}`}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{leave.user?.department || 'Staff'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-head)' }}>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-head)', fontWeight: 500 }}>
                      {leave.leaveType || 'CASUAL'}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-sub)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {leave.reason}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: sColor.bg, color: sColor.text, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {leave.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => updateStatus(leave.id, 'APPROVED')} style={{ background: '#10b98120', color: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                          <button onClick={() => updateStatus(leave.id, 'REJECTED')} style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No leave requests found.
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
