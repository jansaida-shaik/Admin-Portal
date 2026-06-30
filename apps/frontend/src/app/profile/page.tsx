'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApi('/me').then(setUser).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone')
    };

    try {
      await fetchApi('/me', { method: 'PUT', body: JSON.stringify(data) });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: 'var(--text-sub)' }}>Loading profile...</div>;
  if (!user) return <div style={{ padding: '24px', color: 'var(--text-sub)' }}>Failed to load profile.</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)', marginBottom: '24px' }}>My Profile</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={48} color="var(--text-sub)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: 'var(--text-head)', fontSize: '20px' }}>{user.name}</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-sub)', fontSize: '14px' }}>{user.role} • {user.department}</p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-head)', fontSize: '18px' }}>Personal Information</h3>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>
              <User size={16}/> Full Name
            </label>
            <input name="name" defaultValue={user.name} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>
              <Mail size={16}/> Email Address (Read Only)
            </label>
            <input name="email" defaultValue={user.email} disabled style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-sub)', cursor: 'not-allowed' }} />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-sub)', fontSize: '14px' }}>
              <Phone size={16}/> Phone Number
            </label>
            <input name="phone" defaultValue={user.phone} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-main)', borderRadius: '8px', color: 'var(--text-head)' }} />
          </div>

          <button type="submit" disabled={saving} className="primary-btn" style={{ padding: '14px', borderRadius: '8px', background: '#F58220', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '10px', width: 'max-content' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
