'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetchApi('/housekeeping/locations').then(setLocations).catch(console.error);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      department: formData.get('department'),
      locationId: formData.get('locationId'),
      phone: formData.get('phone')
    };

    try {
      await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      toast.success('User created successfully!');
      router.push('/users');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)', marginBottom: '24px' }}>Add Portal User</h1>
      
      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Full Name *</label>
          <input name="name" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} placeholder="John Doe" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Email Address *</label>
          <input type="email" name="email" required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} placeholder="john@example.com" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Phone Number</label>
          <input name="phone" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} placeholder="+1 234 567 8900" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Role</label>
            <select name="role" required style={{ width: '100%', padding: '12px', background: '#1c1c1c', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }}>
              <option value="STAFF">Staff</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Department</label>
            <input name="department" defaultValue="GENERAL" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>Primary Location</label>
          <select name="locationId" style={{ width: '100%', padding: '12px', background: '#1c1c1c', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }}>
            <option value="">-- None --</option>
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading} className="primary-btn" style={{ padding: '14px', borderRadius: '8px', background: '#F58220', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          {loading ? 'Creating...' : 'Create User'}
        </button>

      </form>
    </div>
  );
}
