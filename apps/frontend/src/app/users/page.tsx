'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Search, Plus, Shield, ShieldAlert, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchApi('/users');
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
      <div className="responsive-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-head)', margin: 0 }}>Identity & Access</h1>
          <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '14px' }}>Manage portal users, RBAC roles, and profiles.</p>
        </div>
        <Link href="/users/new" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: '#F58220', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          <Plus size={18} /> New User
        </Link>
      </div>

      <div className="glass-card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-main)' }}>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>User Name</th>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Department</th>
              <th style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-sub)' }}>No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-main)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-head)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon size={18} color="var(--text-sub)" />
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-sub)' }}>{u.email}</td>
                  <td style={{ padding: '16px', color: 'var(--text-sub)' }}>
                    <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '12px' }}>
                      {u.department || 'GENERAL'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {u.role === 'ADMIN' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}><ShieldAlert size={14}/> ADMIN</span>}
                    {u.role === 'MANAGER' && <span style={{ color: '#F58220', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}><Shield size={14}/> MANAGER</span>}
                    {u.role === 'STAFF' && <span style={{ color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}><UserIcon size={14}/> STAFF</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
