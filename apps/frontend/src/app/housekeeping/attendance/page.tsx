'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, User as UserIcon, XCircle } from 'lucide-react';

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Bulk form state
  const [formData, setFormData] = useState({
    userId: '',
    status: 'PRESENT',
    checkIn: '09:00',
    checkOut: '18:00'
  });

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attData, usersData] = await Promise.all([
        fetchApi(`/housekeeping/attendance?date=${dateFilter}&limit=1000`),
        fetchApi('/users?limit=1000')
      ]);
      setRecords(attData || []);
      setUsers(usersData?.data || []);
    } catch (e) {
      console.error('Failed to fetch attendance', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        userId: formData.userId,
        date: dateFilter,
        status: formData.status
      };
      
      if (formData.checkIn) {
        payload.checkIn = new Date(`${dateFilter}T${formData.checkIn}:00Z`).toISOString();
      }
      if (formData.checkOut) {
        payload.checkOut = new Date(`${dateFilter}T${formData.checkOut}:00Z`).toISOString();
      }

      await fetchApi('/housekeeping/attendance', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance record.');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PRESENT': return { bg: '#10b98115', text: '#10b981' };
      case 'ABSENT': return { bg: '#ef444415', text: '#ef4444' };
      case 'HALF_DAY': return { bg: '#f59e0b15', text: '#f59e0b' };
      default: return { bg: 'var(--bg-panel)', text: 'var(--text-sub)' };
    }
  };

  const filtered = records.filter(r => (r.user?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Attendance Directory</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Manage workforce check-ins and check-outs.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border-main)',
              color: 'var(--text-head)', padding: '8px 16px', borderRadius: '8px',
              fontSize: '14px', outline: 'none'
            }}
          />
          <ExportButton data={records} filename={`attendance_${dateFilter}.csv`} />
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
            {showAddForm ? 'Cancel' : 'Mark Attendance'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Mark Record for {dateFilter}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</label>
              <select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department || 'General'}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status</label>
              <select required value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Check In Time</label>
              <input type="time" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Check Out Time</label>
              <input type="time" value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Standard Table Interface */}
      <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-main)', overflow: 'hidden' }}>
        
        {/* Search Bar */}
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
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Check In</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const sColor = getStatusColor(record.status);
                return (
                  <tr key={record.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>{record.user?.name || `ID: ${record.userId}`}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{record.user?.department || 'Staff'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: sColor.bg, color: sColor.text, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-head)', fontWeight: 500 }}>
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-head)', fontWeight: 500 }}>
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No attendance records found for this date.
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
