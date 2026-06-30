'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import { Plus, Search, User as UserIcon, XCircle, MapPin, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DutyAllocationPage() {
  const [rosters, setRosters] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    locationId: '',
    assignedDate: '',
    shiftTime: '09:00 AM - 06:00 PM'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rosterData, usersData, locsData] = await Promise.all([
        fetchApi('/housekeeping/roster?limit=1000'),
        fetchApi('/users?limit=1000'),
        fetchApi('/locations?limit=1000')
      ]);
      setRosters(rosterData || []);
      setUsers(usersData?.data || []);
      setLocations(locsData || []);
    } catch (e) {
      console.error('Failed to fetch rosters', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/housekeeping/roster', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setShowAddForm(false);
      fetchData();
      toast.success('Duty assigned successfully');
    } catch (error: any) {
      console.error('Error assigning duty:', error);
      toast.error(error.message || 'Failed to assign duty. Conflict detected.');
    }
  };

  const deleteRoster = async (id: string) => {
    if (!confirm('Are you sure you want to remove this duty?')) return;
    try {
      await fetchApi(`/housekeeping/roster/${id}`, { method: 'DELETE' });
      toast.success('Duty removed');
      fetchData();
    } catch (e) {
      toast.error('Failed to remove duty');
    }
  };

  const filtered = rosters.filter(r => (r.user?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-head)' }}>Duty Allocations</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Manage shifts and location assignments for staff.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ExportButton data={rosters} filename="duty_allocations.csv" />
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
            {showAddForm ? 'Cancel' : 'Assign Duty'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-main)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: 'var(--text-head)' }}>Assign New Duty</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Employee</label>
              <select required value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department || 'General'}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Location (Branch)</label>
              <select required value={formData.locationId} onChange={(e) => setFormData({...formData, locationId: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="">Select Location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} - {l.city}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Assigned Date</label>
              <input type="date" required value={formData.assignedDate} onChange={(e) => setFormData({...formData, assignedDate: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Shift Time</label>
              <select required value={formData.shiftTime} onChange={(e) => setFormData({...formData, shiftTime: e.target.value})} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-main)', color: 'var(--text-head)', padding: '10px 12px', borderRadius: '8px', outline: 'none' }}>
                <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM (Morning)</option>
                <option value="02:00 PM - 11:00 PM">02:00 PM - 11:00 PM (Evening)</option>
                <option value="11:00 PM - 08:00 AM">11:00 PM - 08:00 AM (Night)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
              <button type="submit" style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Save Assignment
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
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Location (Branch)</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Date & Shift</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((roster) => (
                <tr key={roster.id} style={{ borderTop: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-head)', fontSize: '14px' }}>{roster.user?.name || `ID: ${roster.userId}`}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{roster.user?.department || 'Staff'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="var(--text-sub)" />
                      <span style={{ fontSize: '14px', color: 'var(--text-head)', fontWeight: 500 }}>{roster.location?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Calendar size={14} color="var(--text-sub)" />
                      <span style={{ fontSize: '14px', color: 'var(--text-head)' }}>{new Date(roster.assignedDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} color="var(--text-sub)" />
                      <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{roster.shiftTime}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button onClick={() => deleteRoster(roster.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-sub)' }}>
                    No duty allocations found.
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
