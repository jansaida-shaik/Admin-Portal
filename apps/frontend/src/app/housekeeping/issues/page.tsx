'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, AlertOctagon, Clock, User as UserIcon, Calendar, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    itemId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issuesData, itemsData] = await Promise.all([
        fetchApi('/housekeeping/issues'),
        fetchApi('/items?limit=1000')
      ]);
      setIssues(issuesData || []);
      setItems(itemsData?.data || []);
    } catch (e) {
      console.error('Failed to fetch issues', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/housekeeping/issues', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchData();
      toast.success('Issue reported successfully');
      setFormData({ title: '', description: '', priority: 'MEDIUM', itemId: '' });
    } catch (error: any) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/housekeeping/issues/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      toast.success(`Issue marked as ${status.replace('_', ' ')}`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update issue status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return 'var(--text-sub)';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'RESOLVED': return { bg: '#10b98115', text: '#10b981' };
      case 'IN_PROGRESS': return { bg: '#3b82f615', text: '#3b82f6' };
      case 'APPROVED': return { bg: '#8b5cf615', text: '#8b5cf6' };
      case 'REJECTED': return { bg: '#ef444415', text: '#ef4444' };
      case 'PENDING': return { bg: '#f59e0b15', text: '#f59e0b' };
      default: return { bg: 'var(--bg-panel)', text: 'var(--text-sub)' };
    }
  };

  const filtered = issues.filter(i => (i.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Issue Reporting & SLAs</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Track maintenance tickets, SLAs, and priorities.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportButton data={issues} filename="issues.csv" />
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
            {showAddForm ? 'Cancel' : 'Report Issue'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Report New Issue</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="E.g., Broken AC in Lobby" style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Priority</label>
              <select required value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="LOW">Low (7 Days SLA)</option>
                <option value="MEDIUM">Medium (3 Days SLA)</option>
                <option value="HIGH">High (2 Days SLA)</option>
                <option value="URGENT">Urgent (1 Day SLA)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Related Asset/Item (Optional)</label>
              <select value={formData.itemId} onChange={(e) => setFormData({...formData, itemId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">None</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Description</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the issue in detail..." rows={4} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Submit Ticket
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
              placeholder="Search issues by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-body)', border: '1px solid var(--border-main)', padding: '10px 16px 10px 44px', borderRadius: '8px', color: 'var(--text-head)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading issues...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-body)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Ticket</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Reported By</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>SLA / Due</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue) => {
                const sColor = getStatusColor(issue.status);
                const isOverdue = issue.slaDueDate && new Date(issue.slaDueDate) < new Date() && issue.status !== 'RESOLVED';

                return (
                  <tr key={issue.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getPriorityColor(issue.priority) }}>
                          <AlertOctagon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>{issue.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{issue.item ? `Asset: ${issue.item.name}` : 'General Issue'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserIcon size={14} color="var(--text-sub)" />
                        <span style={{ fontSize: '13px', color: 'var(--text-head)', fontWeight: 500 }}>{issue.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isOverdue ? '#ef4444' : 'var(--text-head)' }}>
                        <Clock size={14} />
                        <span style={{ fontSize: '13px', fontWeight: isOverdue ? 700 : 500 }}>
                          {issue.slaDueDate ? new Date(issue.slaDueDate).toLocaleDateString() : 'No SLA'}
                        </span>
                      </div>
                      {isOverdue && <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>SLA BREACHED</div>}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: sColor.bg, color: sColor.text, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <select 
                        value={issue.status} 
                        onChange={(e) => updateStatus(issue.id, e.target.value)}
                        style={{
                          background: 'var(--bg-body)', border: '1px solid var(--border-main)',
                          color: 'var(--text-head)', padding: '6px 12px', borderRadius: '6px', outline: 'none', fontSize: '12px'
                        }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No issues found.
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
